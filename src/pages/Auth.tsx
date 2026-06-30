import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Mail, Lock, User, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import Button from '../components/ui/Button';
import ImageUpload from '../components/ui/ImageUpload';

type Mode = 'login' | 'signup';

const Auth: React.FC = () => {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (user) return <Navigate to="/" replace />;

  const validateLogin = () => {
    const e: Record<string, string> = {};
    if (!loginEmail) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(loginEmail)) e.email = 'Enter a valid email';
    if (!loginPassword) e.password = 'Password is required';
    else if (loginPassword.length < 6) e.password = 'At least 6 characters';
    return e;
  };

  const validateSignup = () => {
    const e: Record<string, string> = {};
    if (!signupName.trim()) e.name = 'Name is required';
    if (!signupEmail) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(signupEmail)) e.email = 'Enter a valid email';
    if (!signupPassword) e.password = 'Password is required';
    else if (signupPassword.length < 6) e.password = 'At least 6 characters';
    if (!avatarFile) e.avatar = 'A profile photo is required';
    return e;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateLogin();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await signIn(loginEmail, loginPassword);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      toast.error(msg.includes('Invalid') ? 'Invalid email or password' : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateSignup();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await signUp(signupEmail, signupPassword, signupName.trim(), avatarFile!);
      toast.success('Account created! Welcome to FindYourPlace.');
      navigate('/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Signup failed';
      toast.error(msg.includes('already registered') ? 'Email already in use' : msg);
    } finally {
      setLoading(false);
    }
  };

  const pexelsPhoto = 'https://images.pexels.com/photos/1320684/pexels-photo-1320684.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';

  return (
    <div className="auth-page">
      {/* Left panel — illustration */}
      <div className="auth-left" aria-hidden="true">
        <img
          src={pexelsPhoto}
          alt=""
          className="auth-bg-image"
          loading="lazy"
        />
        <div className="auth-left-overlay">
          <div className="auth-left-content">
            <div className="auth-logo-mark">
              <MapPin size={32} strokeWidth={2.5} />
            </div>
            <h1 className="auth-tagline">Discover &amp; share the world's best places</h1>
            <p className="auth-sub">Join thousands of explorers sharing hidden gems, favourite spots, and must-visit destinations.</p>
          </div>
          <div className="auth-left-stats">
            {[['10K+', 'Places'], ['5K+', 'Explorers'], ['50+', 'Countries']].map(([num, label]) => (
              <div key={label} className="auth-stat">
                <span className="auth-stat-num">{num}</span>
                <span className="auth-stat-label">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="auth-right">
        <div className="auth-form-wrap">
          {/* Mode toggle */}
          <div className="auth-mode-toggle" role="tablist">
            {(['login', 'signup'] as Mode[]).map(m => (
              <button
                key={m}
                role="tab"
                aria-selected={mode === m}
                className={`auth-mode-btn ${mode === m ? 'auth-mode-btn-active' : ''}`}
                onClick={() => { setMode(m); setErrors({}); }}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
            >
              {mode === 'login' ? (
                <form onSubmit={handleLogin} noValidate aria-label="Sign in form">
                  <div className="auth-form-header">
                    <h2 className="auth-form-title">Welcome back</h2>
                    <p className="auth-form-subtitle">Sign in to continue exploring</p>
                  </div>
                  <div className="form-stack">
                    <Input
                      label="Email"
                      type="email"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      error={errors.email}
                      icon={<Mail size={16} />}
                      autoComplete="email"
                      placeholder="you@example.com"
                    />
                    <Input
                      label="Password"
                      type="password"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      error={errors.password}
                      icon={<Lock size={16} />}
                      autoComplete="current-password"
                      placeholder="••••••••"
                    />
                  </div>
                  <Button
                    type="submit"
                    fullWidth
                    loading={loading}
                    iconRight={<ArrowRight size={16} />}
                    style={{ marginTop: '1.5rem' }}
                  >
                    Sign In
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleSignup} noValidate aria-label="Create account form">
                  <div className="auth-form-header">
                    <h2 className="auth-form-title">Create your account</h2>
                    <p className="auth-form-subtitle">Start sharing your favourite places</p>
                  </div>
                  <div className="form-stack">
                    <ImageUpload
                      onFileSelect={setAvatarFile}
                      label="Profile Photo"
                      error={errors.avatar}
                      circular
                    />
                    <Input
                      label="Full Name"
                      type="text"
                      value={signupName}
                      onChange={e => setSignupName(e.target.value)}
                      error={errors.name}
                      icon={<User size={16} />}
                      autoComplete="name"
                      placeholder="Jane Smith"
                    />
                    <Input
                      label="Email"
                      type="email"
                      value={signupEmail}
                      onChange={e => setSignupEmail(e.target.value)}
                      error={errors.email}
                      icon={<Mail size={16} />}
                      autoComplete="email"
                      placeholder="you@example.com"
                    />
                    <Input
                      label="Password"
                      type="password"
                      value={signupPassword}
                      onChange={e => setSignupPassword(e.target.value)}
                      error={errors.password}
                      icon={<Lock size={16} />}
                      autoComplete="new-password"
                      placeholder="At least 6 characters"
                      hint="Minimum 6 characters"
                    />
                  </div>
                  <Button
                    type="submit"
                    fullWidth
                    loading={loading}
                    iconRight={<ArrowRight size={16} />}
                    style={{ marginTop: '1.5rem' }}
                  >
                    Create Account
                  </Button>
                </form>
              )}
            </motion.div>
          </AnimatePresence>

          <p className="auth-switch-text">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              className="auth-switch-link"
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setErrors({}); }}
            >
              {mode === 'login' ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
