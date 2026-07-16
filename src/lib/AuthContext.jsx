"use client";

import React, { createContext, useState, useContext, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data ?? null);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      setIsAuthenticated(!!u);
      if (u) fetchProfile(u.id);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
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
  }, []);

  const signOut = () => supabase.auth.signOut();

  // role helpers
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
