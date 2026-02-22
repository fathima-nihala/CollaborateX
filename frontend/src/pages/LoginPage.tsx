import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { login, clearError } from '../store/slices/authSlice';

// ─── Schema ───────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ─── Icons ────────────────────────────────────────────────────────────────────
const MailIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

// ─── Field Component ──────────────────────────────────────────────────────────
interface FieldProps {
  label: string;
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  registration: any;
  error?: { message?: string };
  rightElement?: React.ReactNode;
}

const Field: React.FC<FieldProps> = ({ label, icon, type, placeholder, registration, error, rightElement }) => (
  <div className="mb-4">
    <label className="block text-xs font-semibold text-slate-400 mb-1.5 tracking-wide uppercase">
      {label}
    </label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
        {icon}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        className={`w-full bg-white/5 border rounded-xl py-3 pl-10 pr-${rightElement ? '10' : '4'} text-sm text-slate-200 placeholder-slate-600 outline-none transition-all duration-200
          focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
          ${error ? 'border-red-500/60' : 'border-white/10'}`}
        {...registration}
      />
      {rightElement && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2">
          {rightElement}
        </span>
      )}
    </div>
    {error?.message && (
      <p className="text-red-400 text-xs mt-1.5">{error.message}</p>
    )}
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
export const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => () => { dispatch(clearError()); }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: LoginFormData) => {
    const result = await dispatch(login(data));
    if (login.fulfilled.match(result)) navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Google Font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'); body{font-family:'Inter',sans-serif;}`}</style>

      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />

      {/* Card */}
      <div className="relative w-full max-w-md bg-white/[0.04] border border-white/[0.08] rounded-2xl backdrop-blur-2xl shadow-[0_32px_80px_rgba(0,0,0,0.5)] p-10 animate-[fadeUp_0.45s_cubic-bezier(0.22,1,0.36,1)_both]">
        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}`}</style>

        {/* Brand */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-sm font-bold text-slate-200 tracking-wide">CollaborateX</span>
        </div>

        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mb-1">Welcome back</h1>
        <p className="text-sm text-slate-500 mb-7">Sign in to continue to your workspace</p>

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-6">
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="flex-1">{error}</span>
            <button onClick={() => dispatch(clearError())} className="text-red-400/60 hover:text-red-400 transition-colors cursor-pointer">✕</button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Field
            label="Email address"
            icon={<MailIcon />}
            type="email"
            placeholder="you@example.com"
            registration={register('email')}
            error={errors.email}
          />
          <Field
            label="Password"
            icon={<LockIcon />}
            type={showPassword ? 'text' : 'password'}
            placeholder="Your password"
            registration={register('password')}
            error={errors.password}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            }
          />

          <div className="h-px bg-white/[0.06] my-6" />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-sm tracking-wide
              hover:opacity-90 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
                </svg>
                Signing in…
              </span>
            ) : (
              'Sign In →'
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};
