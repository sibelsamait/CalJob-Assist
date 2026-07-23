import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase, useAuth } from '@/lib/AuthContext';
import { getSystemEvents } from '@/lib/constants/system-events';

function getMonthRange(year, month) {
  const firstDay = new Date(Date.UTC(year, month, 1));
  const lastDay = new Date(Date.UTC(year, month + 1, 1));
  return { from: firstDay.toISOString(), to: lastDay.toISOString() };
}

function normalizeSystemEvent(event, year) {
  return {
    ...event,
    id: `system-${year}-${event.key}`,
    event_type: event.eventType,
    start_date: event.startDate,
    end_date: event.endDate ?? null,
    is_all_day: event.isAllDay ?? false,
    source: 'system',
    user_id: null,
    company_id: null,
  };
}

export function useCalendar(year, month) {
  const { user } = useAuth();
  const [userEvents, setUserEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const systemEvents = useMemo(
    () => getSystemEvents(year).map((event) => normalizeSystemEvent(event, year))
      .filter((event) => {
        const date = new Date(event.start_date);
        return date.getUTCFullYear() === year && date.getUTCMonth() === month;
      }),
    [year, month],
  );

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!supabase || !user) {
      setUserEvents([]);
      setLoading(false);
      return;
    }

    const { from, to } = getMonthRange(year, month);
    const { data, error: queryError } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('is_active', true)
      .gte('start_date', from)
      .lt('start_date', to)
      .neq('source', 'system')
      .order('start_date', { ascending: true });

    if (queryError) {
      setError(queryError);
      setUserEvents([]);
    } else {
      setUserEvents(data ?? []);
    }
    setLoading(false);
  }, [month, user, year]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const addEvent = useCallback(async (event) => {
    if (!supabase || !user) throw new Error('Debes iniciar sesión para crear un evento.');
    const payload = { ...event, user_id: user.id, source: 'user' };
    const { data, error: insertError } = await supabase
      .from('calendar_events')
      .insert(payload)
      .select()
      .single();
    if (insertError) throw insertError;
    setUserEvents((current) => [...current, data].sort((a, b) => new Date(a.start_date) - new Date(b.start_date)));
    return data;
  }, [user]);

  const updateEvent = useCallback(async (eventId, changes) => {
    if (!supabase || !user) throw new Error('Debes iniciar sesión para editar un evento.');
    const { data, error: updateError } = await supabase
      .from('calendar_events')
      .update({ ...changes, updated_at: new Date().toISOString() })
      .eq('id', eventId)
      .eq('user_id', user.id)
      .eq('source', 'user')
      .select()
      .single();
    if (updateError) throw updateError;
    setUserEvents((current) => current.map((event) => (event.id === eventId ? data : event)));
    return data;
  }, [user]);

  const deleteEvent = useCallback(async (eventId) => {
    if (!supabase || !user) throw new Error('Debes iniciar sesión para eliminar un evento.');
    const { error: deleteError } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', eventId)
      .eq('user_id', user.id)
      .eq('source', 'user');
    if (deleteError) throw deleteError;
    setUserEvents((current) => current.filter((event) => event.id !== eventId));
  }, [user]);

  return useMemo(() => ({
    events: [...systemEvents, ...userEvents].sort((a, b) => new Date(a.start_date) - new Date(b.start_date)),
    loading,
    error,
    addEvent,
    updateEvent,
    deleteEvent,
    refresh: loadEvents,
  }), [addEvent, deleteEvent, error, loadEvents, loading, systemEvents, updateEvent, userEvents]);
}

export default useCalendar;
