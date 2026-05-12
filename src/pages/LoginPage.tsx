import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Boxes, Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../auth/AuthContext';
import { errorMessage } from '../api/client';

export function LoginPage() {
  const nav = useNavigate();
  const loc = useLocation();
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Login va parolni kiriting');
      return;
    }
    setBusy(true);
    try {
      await signIn(username, password);
      const from = (loc.state as any)?.from || '/';
      nav(from, { replace: true });
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-bg via-bg to-black">
      <div className="card w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-gold/30 to-gold/10 border border-gold/40 flex items-center justify-center mb-4">
            <Boxes className="text-gold" size={28} />
          </div>
          <div className="text-gold font-bold tracking-widest">SADINOV STORE</div>
          <div className="text-sub text-sm mt-1">Admin paneli</div>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label">Login</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input
                type="text"
                className="input pl-9"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                autoFocus
                autoComplete="username"
              />
            </div>
          </div>
          <div>
            <label className="label">Parol</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input
                type="password"
                className="input pl-9"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
          </div>
          <button type="submit" disabled={busy} className="btn-gold w-full justify-center py-3">
            {busy ? 'Kirilmoqda...' : 'Kirish'}
          </button>
        </form>
      </div>
    </div>
  );
}
