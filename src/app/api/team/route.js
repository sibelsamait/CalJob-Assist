import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

async function getManager() {
  const authClient = createRouteHandlerClient({ cookies });
  const { data: { user }, error: authError } = await authClient.auth.getUser();
  if (authError || !user) return { error: NextResponse.json({ error: 'No autorizado' }, { status: 401 }) };
  const serviceClient = getSupabaseServer();
  if (!serviceClient) return { error: NextResponse.json({ error: 'Supabase no está configurado' }, { status: 500 }) };
  const { data: profile, error } = await serviceClient.from('profiles').select('id, role, company_id').eq('id', user.id).single();
  if (error || !profile || !['plan_owner', 'admin'].includes(profile.role)) return { error: NextResponse.json({ error: 'No tienes permisos para esta sección' }, { status: 403 }) };
  if (!profile.company_id && profile.role !== 'admin') return { error: NextResponse.json({ error: 'Tu cuenta no tiene una empresa asociada' }, { status: 400 }) };
  return { serviceClient, profile };
}

export async function GET() {
  const manager = await getManager();
  if (manager.error) return manager.error;
  let query = manager.serviceClient.from('profiles').select('id, full_name, role, plan, company_id').in('role', ['team_member', 'readonly']);
  if (manager.profile.company_id) query = query.eq('company_id', manager.profile.company_id);
  const { data: profiles, error } = await query.order('created_at', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const { data: usersData } = await manager.serviceClient.auth.admin.listUsers({ perPage: 1000 });
  const users = usersData?.users || [];
  const members = (profiles || []).map((profile) => ({ ...profile, email: users.find((user) => user.id === profile.id)?.email || '' }));
  return NextResponse.json({ members });
}

export async function POST(request) {
  const manager = await getManager();
  if (manager.error) return manager.error;
  const { email, role = 'team_member' } = await request.json();
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: 'Ingresa un correo válido' }, { status: 400 });
  if (!['team_member', 'readonly'].includes(role)) return NextResponse.json({ error: 'Rol no permitido' }, { status: 400 });

  const { data, error } = await manager.serviceClient.auth.admin.inviteUserByEmail(email, { data: { role, company_id: manager.profile.company_id } });
  if (error || !data.user) return NextResponse.json({ error: error?.message || 'No se pudo enviar la invitación' }, { status: 500 });
  const { error: profileError } = await manager.serviceClient.from('profiles').update({ role, company_id: manager.profile.company_id, updated_at: new Date().toISOString() }).eq('id', data.user.id);
  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 });
  return NextResponse.json({ member: { id: data.user.id, email, role } }, { status: 201 });
}