"use client";

import React, { createContext, useState, useContext, useEffect } from 'react';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = typeof window !== 'undefined' && SUPABASE_URL && SUPABASE_ANON_KEY
  ? createBrowserSupabaseClient({ supabaseUrl: SUPABASE_URL, supabaseKey: SUPABASE_ANON_KEY })
  : null;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [supabaseClient] = useState(() => {
    if (typeof window === 'undefined' || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return null;
    }

    return createBrowserSupabaseClient({ supabaseUrl: SUPABASE_URL, supabaseKey: SUPABASE_ANON_KEY });
  });
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId) => {
    if (!supabaseClient) return;

    const { data } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data ?? null);
  };

  useEffect(() => {
    if (!supabaseClient) {
      setIsLoading(false);
      return;
    }

    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      setIsAuthenticated(!!u);
      if (u) fetchProfile(u.id);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (_event, session) => {
        const u = session?.user ?? null;
        setUser(u);
        setIsAuthenticated(!!u);
        if (u) await fetchProfile(u.id);
        else setProfile(null);
        setIsLoading(false);
      }
    );

    return () => subscription?.unsubscribe();
  }, [supabase]);

  const signOut = async () => {
    if (!supabaseClient) return;
    await supabaseClient.auth.signOut();
  };

  const isAdmin = profile?.role === 'admin';
  const isTecnico = profile?.role === 'tecnico';
  const isStaff = isAdmin || isTecnico;

  const value = {
    user,
    profile,
    isAuthenticated,
    isLoading,
    isAdmin,
    isTecnico,
    isStaff,
    signOut,
    refetchProfile: () => user && fetchProfile(user.id),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
