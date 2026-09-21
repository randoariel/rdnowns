'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../admin.module.css';

type Step = 'login' | 'forgot-username' | 'forgot-question' | 'forgot-reset';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('login');
  const [form, setForm] = useState({
    username: '',
    password: '',
    answer: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [question, setQuestion] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push('/admin');
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotUsername(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/forgot-password?username=${encodeURIComponent(form.username)}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setQuestion(data.question);
      setStep('forgot-question');
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotAnswer(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, answer: form.answer }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setResetToken(data.token);
      setStep('forgot-reset');
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (form.newPassword !== form.confirmPassword) {
      setError('Password tidak cocok.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, newPassword: form.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setStep('login');
      setError('');
      alert('Password berhasil diubah. Silakan login.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>

        {step === 'login' && (
          <>
            <h1 className={styles.authTitle}>Admin</h1>
            <form onSubmit={handleLogin} className={styles.form} noValidate>
              <div className={styles.field}>
                <label htmlFor="login-username" className={styles.label}>Username</label>
                <input
                  id="login-username"
                  type="text"
                  className={styles.input}
                  value={form.username}
                  onChange={(e) => update('username', e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="login-password" className={styles.label}>Password</label>
                <input
                  id="login-password"
                  type="password"
                  className={styles.input}
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              {error && <p className={styles.error} role="alert">{error}</p>}
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Masuk...' : 'Masuk'}
              </button>
              <button
                type="button"
                className={styles.linkBtn}
                onClick={() => { setStep('forgot-username'); setError(''); }}
              >
                Lupa password
              </button>
            </form>
          </>
        )}

        {step === 'forgot-username' && (
          <>
            <h1 className={styles.authTitle}>Lupa Password</h1>
            <form onSubmit={handleForgotUsername} className={styles.form} noValidate>
              <div className={styles.field}>
                <label htmlFor="forgot-username" className={styles.label}>Username</label>
                <input
                  id="forgot-username"
                  type="text"
                  className={styles.input}
                  value={form.username}
                  onChange={(e) => update('username', e.target.value)}
                  required
                />
              </div>
              {error && <p className={styles.error} role="alert">{error}</p>}
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Mencari...' : 'Lanjut'}
              </button>
              <button type="button" className={styles.linkBtn} onClick={() => setStep('login')}>
                Kembali
              </button>
            </form>
          </>
        )}

        {step === 'forgot-question' && (
          <>
            <h1 className={styles.authTitle}>Pertanyaan Keamanan</h1>
            <p className={styles.authSub}>{question}</p>
            <form onSubmit={handleForgotAnswer} className={styles.form} noValidate>
              <div className={styles.field}>
                <label htmlFor="forgot-answer" className={styles.label}>Jawaban</label>
                <input
                  id="forgot-answer"
                  type="text"
                  className={styles.input}
                  value={form.answer}
                  onChange={(e) => update('answer', e.target.value)}
                  required
                />
              </div>
              {error && <p className={styles.error} role="alert">{error}</p>}
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Memeriksa...' : 'Verifikasi'}
              </button>
            </form>
          </>
        )}

        {step === 'forgot-reset' && (
          <>
            <h1 className={styles.authTitle}>Password Baru</h1>
            <form onSubmit={handleResetPassword} className={styles.form} noValidate>
              <div className={styles.field}>
                <label htmlFor="new-password" className={styles.label}>Password Baru</label>
                <input
                  id="new-password"
                  type="password"
                  className={styles.input}
                  value={form.newPassword}
                  onChange={(e) => update('newPassword', e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="confirm-password" className={styles.label}>Konfirmasi Password</label>
                <input
                  id="confirm-password"
                  type="password"
                  className={styles.input}
                  value={form.confirmPassword}
                  onChange={(e) => update('confirmPassword', e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
              {error && <p className={styles.error} role="alert">{error}</p>}
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Menyimpan...' : 'Simpan Password'}
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
}
