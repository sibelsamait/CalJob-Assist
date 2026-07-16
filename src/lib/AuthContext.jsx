"use client";

import React, { createContext, useState, useContext, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// TODO: Replace with your Supabase URL and anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { data: { session } } = supabase.auth.getSession();
    setUser(session?.user ?? null);
    setIsAuthenticated(!!session?.user);
    setIsLoading(false);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session?.user);
        setIsLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    signOut: () => supabase.auth.signOut(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
