import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (username: string, password: string) => Promise<{ error: any }>;
  signUp: (username: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 简单密码哈希
async function hashPassword(password: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'liu-ptr-salt');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    let hash = 0;
    const str = password + 'liu-ptr-salt';
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
      setError('加载超时，请检查网络连接');
    }, 5000);

    AsyncStorage.getItem('liu-ptr-user')
      .then((userData) => {
        if (userData) {
          try {
            setUser(JSON.parse(userData));
          } catch (e) {
            AsyncStorage.removeItem('liu-ptr-user');
          }
        }
      })
      .catch((err) => {
        console.warn('AsyncStorage 读取失败:', err);
        setError('本地存储读取失败: ' + err.message);
      })
      .finally(() => {
        clearTimeout(timeout);
        setLoading(false);
      });

    return () => clearTimeout(timeout);
  }, []);

  const signIn = async (username: string, password: string) => {
    try {
      setError(null);
      const passwordHash = await hashPassword(password);

      const { data, error: dbError } = await supabase
        .from('users')
        .select('id, username')
        .eq('username', username)
        .eq('password_hash', passwordHash)
        .maybeSingle();

      if (dbError || !data) {
        return { error: { message: '用户名或密码错误' } };
      }

      const userData = { id: data.id, username: data.username };
      setUser(userData);
      await AsyncStorage.setItem('liu-ptr-user', JSON.stringify(userData));

      return { error: null };
    } catch (err: any) {
      const msg = err.message || '登录失败，请检查网络';
      setError(msg);
      return { error: { message: msg } };
    }
  };

  const signUp = async (username: string, password: string) => {
    try {
      setError(null);
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .maybeSingle();

      if (existing) {
        return { error: { message: '用户名已存在' } };
      }

      const passwordHash = await hashPassword(password);

      const { data, error: dbError } = await supabase
        .from('users')
        .insert({ username, password_hash: passwordHash })
        .select('id, username')
        .single();

      if (dbError) {
        return { error: { message: '注册失败：' + dbError.message } };
      }

      const userData = { id: data.id, username: data.username };
      setUser(userData);
      await AsyncStorage.setItem('liu-ptr-user', JSON.stringify(userData));

      return { error: null };
    } catch (err: any) {
      const msg = err.message || '注册失败，请检查网络';
      setError(msg);
      return { error: { message: msg } };
    }
  };

  const signOut = async () => {
    setUser(null);
    await AsyncStorage.removeItem('liu-ptr-user');
  };

  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
