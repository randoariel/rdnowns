'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import styles from '../admin.module.css';

interface ResultItem {
  id: string;
  thumbnail_url: string;
  title: string;
  category?: string;
  project_url: string;
  sort_order: number;
  is_pinned: boolean;
  is_published: boolean;
  created_at: string;
}

export default function ResultsPage() {
  const [items, setItems] = useState<ResultItem[]>([]);
  const [selectedTab, setSelectedTab] = useState<'all' | 'graphic' | 'video'>('all');
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/results');
      const data = await res.json();
      setItems(data);
    } catch {
      setError('Gagal memuat data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  async function togglePin(id: string, current: boolean, category: string = 'video') {
    setError('');
    // Check if pinning and already 5 pinned for THIS category
    if (!current) {
      const currentPinnedCount = items.filter(
        i => i.is_pinned && (i.category || 'video') === category
      ).length;
      if (currentPinnedCount >= 5) {
        setError(`Maksimal 5 item yang dapat di-pin untuk kategori ${category === 'graphic' ? 'Graphic Design' : 'Video Editor'}.`);
        return;
      }
    }

    const res = await fetch(`/api/admin/results/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_pinned: !current }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Gagal mengubah status pin.');
      return;
    }
    fetchItems();
  }

  async function togglePublish(id: string, current: boolean) {
    await fetch(`/api/admin/results/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: !current }),
    });
    fetchItems();
  }

  async function moveOrder(id: string, direction: 'up' | 'down') {
    const idx = items.findIndex((i) => i.id === id);
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === items.length - 1) return;

    const newItems = [...items];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    [newItems[idx], newItems[swapIdx]] = [newItems[swapIdx], newItems[idx]];

    const order = newItems.map((item, i) => ({ id: item.id, sort_order: i }));
    await fetch('/api/admin/results', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order }),
    });
    fetchItems();
  }

  async function confirmDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/results/${deleteId}`, { method: 'DELETE' });
      setDeleteId(null);
      fetchItems();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className={styles.adminLayout}>
      <aside className={styles.adminSidebar}>
        <div className={styles.adminSidebarBrand}>RDN Admin</div>
        <nav className={styles.adminNav} aria-label="Admin navigation">
          <Link href="/admin" className={styles.adminNavLink}>Overview</Link>
          <Link href="/admin/results" className={`${styles.adminNavLink} ${styles.adminNavLinkActive}`}>Results</Link>
          <Link href="/admin/skills" className={styles.adminNavLink}>Software Skills</Link>
          <Link href="/admin/instagram" className={styles.adminNavLink}>Instagram</Link>
          <Link href="/admin/settings" className={styles.adminNavLink}>Settings</Link>
        </nav>
        <LogoutBtn />
      </aside>

      <main className={styles.adminContent}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <h1 className={styles.adminPageTitle} style={{ margin: 0 }}>Results Management</h1>
          <Link href="/admin/results/new" className={styles.submitBtn}>
            + Tambah Karya (Graphic / Video)
          </Link>
        </div>

        {/* Category Filter Tabs for Admin */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--space-5)' }}>
          <button
            type="button"
            onClick={() => setSelectedTab('all')}
            className={selectedTab === 'all' ? styles.submitBtn : styles.secondaryBtn}
            style={{ fontSize: '12px', padding: '6px 14px' }}
          >
            Semua ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab('graphic')}
            className={selectedTab === 'graphic' ? styles.submitBtn : styles.secondaryBtn}
            style={{ fontSize: '12px', padding: '6px 14px' }}
          >
            Graphic Design ({items.filter(i => (i.category || 'video') === 'graphic').length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab('video')}
            className={selectedTab === 'video' ? styles.submitBtn : styles.secondaryBtn}
            style={{ fontSize: '12px', padding: '6px 14px' }}
          >
            Video Editor ({items.filter(i => (i.category || 'video') === 'video').length})
          </button>
        </div>

        {error && <p className={styles.error} role="alert">{error}</p>}

        {loading ? (
          <p style={{ color: 'var(--text-faint)' }}>Memuat...</p>
        ) : items.length === 0 ? (
          <p style={{ color: 'var(--text-faint)' }}>Belum ada result. Tambah yang pertama.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Thumbnail</th>
                <th>Judul & URL</th>
                <th>Show Off (Pin max 5)</th>
                <th>Status</th>
                <th>Urutan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items
                .filter(item => selectedTab === 'all' || (item.category || 'video') === selectedTab)
                .map((item, idx) => (
                <tr key={item.id}>
                  <td>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.thumbnail_url}
                      alt="thumbnail"
                      className={styles.thumbPreview}
                    />
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: (item.category || 'video') === 'graphic' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(168, 85, 247, 0.2)',
                        color: (item.category || 'video') === 'graphic' ? '#60a5fa' : '#c084fc',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        textTransform: 'uppercase',
                        fontWeight: 700,
                      }}>
                        {(item.category || 'video') === 'graphic' ? 'GRAPHIC' : 'VIDEO'}
                      </span>
                      <p style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--text)' }}>
                        {item.title || 'Untitled'}
                      </p>
                    </div>
                    <a
                      href={item.project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--text-dim)', textDecoration: 'underline', fontSize: 'var(--font-size-xs)' }}
                    >
                      {item.project_url.length > 35 ? item.project_url.slice(0, 35) + '...' : item.project_url}
                    </a>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => togglePin(item.id, item.is_pinned, item.category || 'video')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 'var(--font-weight-medium)',
                        backgroundColor: item.is_pinned ? 'rgba(255, 215, 0, 0.15)' : 'var(--surface-2)',
                        color: item.is_pinned ? '#ffd700' : 'var(--text-dim)',
                        border: item.is_pinned ? '1px solid rgba(255, 215, 0, 0.4)' : '1px solid var(--border)',
                        cursor: 'pointer'
                      }}
                      title={item.is_pinned ? 'Klik untuk unpin' : 'Klik untuk pin (tampil di Result depan)'}
                    >
                      {item.is_pinned ? '⭐ Pinned (Depan)' : '☆ Biasa'}
                    </button>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => togglePublish(item.id, item.is_published)}
                      className={`${styles.badge} ${item.is_published ? styles.badgePublished : styles.badgeDraft}`}
                      style={{ cursor: 'pointer', border: 'none' }}
                      title="Klik untuk mengubah status Publish / Draft"
                    >
                      {item.is_published ? '✓ Published' : '○ Draft'}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      <button
                        className={styles.secondaryBtn}
                        onClick={() => moveOrder(item.id, 'up')}
                        disabled={idx === 0}
                        aria-label="Geser ke atas"
                      >
                        ↑
                      </button>
                      <button
                        className={styles.secondaryBtn}
                        onClick={() => moveOrder(item.id, 'down')}
                        disabled={idx === items.length - 1}
                        aria-label="Geser ke bawah"
                      >
                        ↓
                      </button>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                      <button
                        className={styles.secondaryBtn}
                        onClick={() => togglePublish(item.id, item.is_published)}
                      >
                        {item.is_published ? 'Unpublish' : 'Publish'}
                      </button>
                      <Link
                        href={`/admin/results/${item.id}/edit`}
                        className={styles.secondaryBtn}
                      >
                        Edit
                      </Link>
                      <button
                        className={styles.dangerBtn}
                        onClick={() => setDeleteId(item.id)}
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Delete confirmation dialog (R-26: closable with Escape) */}
        {deleteId && (
          <DeleteDialog
            onCancel={() => setDeleteId(null)}
            onConfirm={confirmDelete}
            loading={deleting}
          />
        )}
      </main>
    </div>
  );
}

function DeleteDialog({
  onCancel,
  onConfirm,
  loading,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onCancel]);

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className={styles.dialog}>
        <h2 id="delete-dialog-title" className={styles.dialogTitle}>Hapus result?</h2>
        <p className={styles.dialogText}>Tindakan ini tidak bisa dibatalkan. Thumbnail akan dihapus dari storage.</p>
        <div className={styles.dialogActions}>
          <button className={styles.secondaryBtn} onClick={onCancel} disabled={loading}>
            Batal
          </button>
          <button className={styles.dangerBtn} onClick={onConfirm} disabled={loading}>
            {loading ? 'Menghapus...' : 'Hapus'}
          </button>
        </div>
      </div>
    </div>
  );
}

function LogoutBtn() {
  const router = useRouter();
  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  }
  return (
    <button type="button" onClick={handleLogout} className={styles.linkBtn}>
      Keluar
    </button>
  );
}

import { useRouter } from 'next/navigation';
