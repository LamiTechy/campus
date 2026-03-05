// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else { setProfile(null); setLoading(false); }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    setProfile(data);
    setLoading(false);
  }

  async function signUp(email, password, fullName, university = '', whatsapp = '') {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${import.meta.env.VITE_SITE_URL || window.location.origin}/login?verified=true`,
      },
    });

    // Save university + whatsapp to profile
    if (!error && data?.user) {
      try {
        await supabase.from('profiles').update({
          university,
          whatsapp_number: whatsapp,
        }).eq('id', data.user.id);
      } catch (profileErr) {
        console.warn('Profile update error:', profileErr);
      }
    }

    // Send custom branded verification email
    if (!error && data?.user) {
      try {
        // Get the confirmation URL from Supabase session
        const verifyUrl = `${window.location.origin}/login?verified=true`;
        await supabase.functions.invoke('send-email', {
          body: {
            type: 'verify_email',
            to: email,
            data: {
              name: fullName || 'there',
              verify_url: verifyUrl,
            },
          },
        });
      } catch (emailErr) {
        console.warn('Custom email failed, Supabase default used:', emailErr);
      }
    }

    return { error };
  }

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function refreshProfile() {
    if (user) await fetchProfile(user.id);
  }

  // Auto-refresh profile when verification_status changes in Supabase
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          // Auto update profile in context when admin verifies/rejects
          setProfile(prev => ({ ...prev, ...payload.new }));
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);