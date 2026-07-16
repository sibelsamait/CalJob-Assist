import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getSupabaseServer } from '@/lib/supabaseServer';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabaseServer = getSupabaseServer();
  if (!supabaseServer) return NextResponse.json({ error: 'Supabase server not ready' }, { status: 500 });

  const { data: profile } = await supabaseServer.from('profiles').select('company_id').eq('id', user.id).single();
  const companyId = profile?.company_id || null;

  // check for active license for user or company
  const q = supabaseServer.from('licenses').select('*').or(`user_id.eq.${user.id},company_id.eq.${companyId}`).eq('status', 'active').limit(1);
  const { data: licenses, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const hasActive = Array.isArray(licenses) && licenses.length > 0;
  return NextResponse.json({ active: hasActive });
}
