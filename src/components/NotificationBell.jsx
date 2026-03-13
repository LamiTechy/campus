// src/components/NotificationBell.jsx
import { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCheck, ShoppingCart, Shield, Package, Info } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useTheme, t } from '../context/ThemeContext';

const TYPE_CONFIG = {
  order:   { icon: ShoppingCart, color: 'text-blue-600 bg-blue-50' },
  success: { icon: CheckCheck,   color: 'text-green-600 bg-green-50' },
  warning: { icon: Shield,       color: 'text-amber-600 bg-amber-50' },
  info:    { icon: Info,         color: 'text-gray-600 bg-gray-100' },
};

export default function NotificationBell() {
  const { user } = useAuth();
  const { dark } = useTheme();
  const th = t(dark);
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();

    // Realtime — new notifications appear instantly
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function fetchNotifications() {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    setNotifications(data || []);
  }

  async function markAllRead() {
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  async function markRead(id) {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }

  const unread = notifications.filter(n => !n.read).length;

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={() => { setOpen(!open); if (!open && unread > 0) markAllRead(); }}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
      >
        <Bell size={20} className="text-gray-600" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs font-black rounded-full flex items-center justify-center leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{ position: 'absolute', right: 0, top: 48, width: 320, background: th.bgCard, border: `1px solid ${th.border}`, borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.4)', zIndex: 50, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: `1px solid ${th.border}` }}>
            <h3 style={{ fontWeight: 900, color: th.text, fontSize: 14 }}>Notifications</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {unread > 0 && <button onClick={markAllRead} style={{ fontSize: 12, color: '#4ade80', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>Mark all read</button>}
              <button onClick={() => setOpen(false)} style={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: th.bgHover, border: 'none', cursor: 'pointer' }}><X size={13} color={th.textSub} /></button>
            </div>
          </div>
          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', gap: 8 }}>
                <Bell size={28} color={th.textMuted} />
                <p style={{ color: th.textMuted, fontSize: 13 }}>No notifications yet</p>
              </div>
            ) : notifications.map(n => {
              const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
              const Icon = cfg.icon;
              const ICON_STYLES = { order: { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa' }, success: { bg: 'rgba(22,163,74,0.15)', color: '#4ade80' }, warning: { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' }, info: { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8' } };
              const ic = ICON_STYLES[n.type] || ICON_STYLES.info;
              return (
                <div key={n.id} onClick={() => { markRead(n.id); if (n.link) window.location.href = n.link; }}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px', cursor: 'pointer', borderBottom: `1px solid ${th.border}`, background: !n.read ? 'rgba(22,163,74,0.04)' : 'transparent' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: ic.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={14} color={ic.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
                      <p style={{ fontSize: 13, fontWeight: !n.read ? 800 : 600, color: th.text, lineHeight: 1.3 }}>{n.title}</p>
                      {!n.read && <div style={{ width: 8, height: 8, background: '#4ade80', borderRadius: '50%', flexShrink: 0, marginTop: 3 }} />}
                    </div>
                    <p style={{ fontSize: 11, color: th.textSub, marginTop: 3, lineHeight: 1.5 }}>{n.message}</p>
                    <p style={{ fontSize: 11, color: th.textMuted, marginTop: 4 }}>{timeAgo(n.created_at)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}