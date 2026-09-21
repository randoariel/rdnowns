'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../admin.module.css';

export default function SetupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    securityQuestion: '',
    securityAnswer: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Password tidak cocok.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
          securityQuestion: form.securityQuestion,
          securityAnswer: form.securityAnswer,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Terjadi kesalahan.');
        return;
      }

      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <h1 className={styles.authTitle}>Setup Admin</h1>
        <p className={styles.authSub}>Buat akun admin pertama kali.</p>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label htmlFor="setup-username" className={styles.label}>Username</label>
            <input
              id="setup-username"
              type="text"
              className={styles.input}
              value={form.username}
              onChange={(e) => update('username', e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="setup-password" className={styles.label}>Password</label>
            <input
              id="setup-password"
              type="password"
              className={styles.input}
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="setup-confirm" className={styles.label}>Konfirmasi Password</label>
            <input
              id="setup-confirm"
              type="password"
              className={styles.input}
              value={form.confirmPassword}
              onChange={(e) => update('confirmPassword', e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="setup-question" className={styles.label}>Pertanyaan Keamanan</label>
            <input
              id="setup-question"
              type="text"
              className={styles.input}
              placeholder="Contoh: Nama hewan peliharaan pertamamu?"
              value={form.securityQuestion}
              onChange={(e) => update('securityQuestion', e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="setup-answer" className={styles.label}>Jawaban</label>
            <input
              id="setup-answer"
              type="text"
              className={styles.input}
              value={form.securityAnswer}
              onChange={(e) => update('securityAnswer', e.target.value)}
              required
            />
          </div>

          {error && (
            <p className={styles.error} role="alert" aria-live="assertive">
              {error}
            </p>
          )}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
            aria-disabled={loading}
          >
            {loading ? 'Menyimpan...' : 'Buat Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}
