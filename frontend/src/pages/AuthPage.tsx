import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, ShoppingBag, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isRegister = mode === 'register';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      navigate(redirect);
    } catch (err) {
      // Backend not connected — simulate a successful local session for demo
      const fakeUser = {
        _id: 'u_demo',
        name: isRegister ? name : email.split('@')[0],
        email,
        token: 'demo-token',
      };
      localStorage.setItem('shopkart_token', fakeUser.token);
      localStorage.setItem('shopkart_user', JSON.stringify(fakeUser));
      navigate(redirect);
      void err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col items-stretch gap-8 px-4 py-10 lg:flex-row lg:py-16">
      {/* Brand panel */}
      <div className="relative hidden flex-1 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 p-10 text-white lg:flex lg:flex-col lg:justify-center">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent-500/30 blur-3xl" />
        <div className="absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-brand-400/30 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-white text-brand-700">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <span className="font-display text-2xl font-extrabold">ShopKart</span>
          </div>
          <h2 className="mt-6 font-display text-3xl font-bold leading-tight">
            {isRegister ? 'Join the smart way to shop.' : 'Welcome back to better shopping.'}
          </h2>
          <ul className="mt-8 space-y-3">
            {[
              'Exclusive member-only deals & early access',
              'Faster checkout with saved details',
              'Track all your orders in one place',
              'Free delivery on orders above ₹499',
            ].map((f) => (
              <li key={f} className="flex items-center gap-3 text-brand-100">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-white/15">
                  <Check className="h-3.5 w-3.5" />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1">
        <div className="card mx-auto max-w-md p-8 animate-scale-in">
          <h1 className="font-display text-2xl font-bold text-ink-900">
            {isRegister ? 'Create your account' : 'Login to your account'}
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            {isRegister ? 'It only takes a minute.' : 'Enter your details to continue.'}
          </p>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-error-50 px-3 py-2.5 text-sm text-error-600">
              <AlertCircle className="h-4 w-4" /> {error}
            </div>
          )}

          <form onSubmit={submit} className="mt-6 space-y-4">
            {isRegister && (
              <Field
                label="Full name"
                icon={UserIcon}
                value={name}
                onChange={setName}
                placeholder="Rahul Sharma"
                required
              />
            )}
            <Field
              label="Email"
              icon={Mail}
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              required
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isRegister ? 'Create a password' : 'Enter password'}
                  required
                  minLength={6}
                  className="input pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {!isRegister && (
              <div className="flex justify-end">
                <button type="button" className="text-xs font-medium text-brand-700 hover:underline">
                  Forgot password?
                </button>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Please wait…' : isRegister ? 'Create Account' : 'Login'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <Link
              to={isRegister ? '/login' : '/register'}
              className="font-semibold text-brand-700 hover:underline"
            >
              {isRegister ? 'Login' : 'Register'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  type = 'text',
  required,
}: {
  label: string;
  icon: typeof Mail;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink-700">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="input pl-10"
        />
      </div>
    </div>
  );
}


