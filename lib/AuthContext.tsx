'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

export type UserType = '여자' | '남자' | '마담';

export const ADMIN_USERNAME = 'dydghks9026';

export interface UserProfile {
  id: string;
  username: string;
  nickname: string;
  birth_date: string;
  user_type: UserType;
  // 공통 선택
  avatar_url?: string;
  avatar_change_count?: number;
  traits?: string[];
  // 여자 전용
  height?: number;
  weight?: number;
  chest_size?: string;
  manager_number?: string;
  real_name?: string;
  madame_name?: string;
  madame_id?: string;
  // 마담 전용
  phone?: string;
  store_name?: string;
  business_card_url?: string;
  is_approved?: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (params: SignUpParams) => Promise<{ error: string | null }>;
  signIn: (username: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  checkUsername: (username: string) => Promise<boolean>;
  resetPassword: (nickname: string, birth_date: string, new_password: string) => Promise<{ error: string | null; username?: string }>;
  updateProfile: (updates: Partial<Omit<UserProfile, 'id' | 'username' | 'user_type'>>) => Promise<{ error: string | null }>;
}

export interface SignUpParams {
  username: string;
  password: string;
  nickname: string;
  birth_date: string;
  user_type: UserType;
  // 마담 전용
  phone?: string;
  store_name?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const toEmail = (username: string) => `${username}@harper.app`;

  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) setProfile(data as UserProfile);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const isAdmin = profile?.username === ADMIN_USERNAME;

  const checkUsername = async (username: string): Promise<boolean> => {
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .maybeSingle();
    return data === null;
  };

  const signUp = async ({ username, password, nickname, birth_date, user_type, phone, store_name }: SignUpParams) => {
    const functionsUrl = process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL;
    const res = await fetch(`${functionsUrl}/auth-signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, nickname, birth_date, user_type, phone, store_name }),
    });

    const json = await res.json();
    if (!res.ok) return { error: json.error || '회원가입에 실패했습니다.' };

    // 가입 성공 후 자동 로그인 (마담도 로그인은 가능, UI에서 승인 여부 처리)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: toEmail(username),
      password,
    });
    if (signInError) return { error: null };

    return { error: null };
  };

  const signIn = async (username: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: toEmail(username),
      password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        return { error: '아이디 또는 비밀번호가 올바르지 않습니다.' };
      }
      return { error: error.message };
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const resetPassword = async (nickname: string, birth_date: string, new_password: string) => {
    const functionsUrl = process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL;
    const res = await fetch(`${functionsUrl}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname, birth_date, new_password }),
    });

    const json = await res.json();
    if (!res.ok) return { error: json.error || '오류가 발생했습니다.' };
    return { error: null, username: json.username };
  };

  const updateProfile = async (updates: Partial<Omit<UserProfile, 'id' | 'username' | 'user_type'>>) => {
    if (!user) return { error: '로그인이 필요합니다.' };

    const dbUpdates: Record<string, unknown> = { ...updates };

    // 사진 변경 횟수 체크 (관리자는 제한 없음)
    if (updates.avatar_url && !isAdmin) {
      const currentCount = profile?.avatar_change_count ?? 0;
      if (currentCount >= 2) {
        return { error: '프로필 사진은 최대 2번까지만 변경할 수 있습니다.' };
      }
      dbUpdates.avatar_change_count = currentCount + 1;
    }

    const { error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', user.id);

    if (error) return { error: error.message };

    setProfile(prev => prev ? {
      ...prev,
      ...updates,
      ...(dbUpdates.avatar_change_count !== undefined
        ? { avatar_change_count: dbUpdates.avatar_change_count as number }
        : {}),
    } : prev);
    return { error: null };
  };

  return (
    <AuthContext.Provider value={{
      user, profile, session, loading, isAdmin,
      signUp, signIn, signOut, checkUsername, resetPassword, updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
