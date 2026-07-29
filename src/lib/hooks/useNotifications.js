import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase, useAuth } from '@/lib/AuthContext';

const NOTIFICATION_LIMIT = 20;

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadNotifications = useCallback(async () => {
    if (!supabase || !user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error: queryError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(NOTIFICATION_LIMIT);

    setNotifications(data ?? []);
    setError(queryError ?? null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (!supabase || !user) return undefined;

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        () => loadNotifications(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadNotifications, user]);

  const markRead = useCallback(async (notificationId) => {
    if (!supabase || !user) return;
    const { error: updateError } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id);
    if (updateError) throw updateError;
    setNotifications((current) => current.map((notification) => (
      notification.id === notificationId ? { ...notification, is_read: true } : notification
    )));
  }, [user]);

  const markAllRead = useCallback(async () => {
    if (!supabase || !user) return;
    const { error: updateError } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    if (updateError) throw updateError;
    setNotifications((current) => current.map((notification) => ({ ...notification, is_read: true })));
  }, [user]);

  return useMemo(() => ({
    notifications,
    unreadCount: notifications.filter((notification) => !notification.is_read).length,
    loading,
    error,
    markRead,
    markAllRead,
    refresh: loadNotifications,
  }), [error, loadNotifications, loading, markAllRead, markRead, notifications]);
}

export default useNotifications;
