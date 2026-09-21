'use client';

import { useRouter } from 'next/navigation';
import styles from './admin.module.css';

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={styles.linkBtn}
      aria-label="Keluar dari admin"
    >
      Keluar
    </button>
  );
}
