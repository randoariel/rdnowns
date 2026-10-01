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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchDeleting, setBatchDeleting] = useState(false);

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
      selectedIds.delete(deleteId);
      setSelectedIds(new Set(selectedIds));
      fetchItems();
    } finally {
      setDeleting(false);
    }
  }

  function toggleSelect(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  }

  function toggleSelectAll() {
    const visible = items.filter(i => selectedTab === 'all' || (i.category || 'video') === selectedTab);
    if (selectedIds.size === visible.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(visible.map(i => i.id)));
    }
  }

  async function batchDelete() {
    if (selectedIds.size === 0) return;
    setBatchDeleting(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map(id => fetch(`/api/admin/results/${id}`, { method: 'DELETE' }))
      );
      setSelectedIds(new Set());
      fetchItems();
    } finally {
      setBatchDeleting(false);
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

        {/* Batch actions bar */}
        {selectedIds.size > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '8px 12px', marginBottom: '12px',
            background: 'rgba(229,115,115,0.08)', border: '1px solid rgba(229,115,115,0.3)',
            borderRadius: 'var(--radius-sm)', fontSize: '13px', color: '#e57373',
          }}>
            <span>{selectedIds.size} item dipilih</span>
            <button
              className={styles.dangerBtn}
              onClick={batchDelete}
              disabled={batchDeleting}
              style={{ fontSize: '11px', padding: '4px 10px' }}
            >
              {batchDeleting ? 'Menghapus...' : 'Hapus Semua Terpilih'}
            </button>
            <button
              className={styles.secondaryBtn}
              onClick={() => setSelectedIds(new Set())}
              style={{ fontSize: '11px', padding: '4px 10px', marginLeft: 'auto' }}
            >
              Batal
            </button>
          </div>
        )}

        {loading ? (
          <p style={{ color: 'var(--text-faint)' }}>Memuat...</p>
        ) : items.length === 0 ? (
          <p style={{ color: 'var(--text-faint)' }}>Belum ada result. Tambah yang pertama.</p>
        ) : (
          <>
            {/* Select all checkbox */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-dim)', marginBottom: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={selectedIds.size === items.filter(i => selectedTab === 'all' || (i.category || 'video') === selectedTab).length && items.length > 0}
                onChange={toggleSelectAll}
                style={{ width: 16, height: 16 }}
              />
              Pilih semua
            </label>

            {/* Card list (mobile-friendly, no horizontal scroll) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {items
                .filter(item => selectedTab === 'all' || (item.category || 'video') === selectedTab)
                .map((item, idx) => (
                <div key={item.id} style={{
                  display: 'flex', gap: '10px', alignItems: 'flex-start',
                  padding: '10px', borderRadius: 'var(--radius-sm)',
                  border: selectedIds.has(item.id) ? '1px solid rgba(229,115,115,0.5)' : '1px solid var(--border)',
                  background: 'var(--surface)',
                }}>
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedIds.has(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    style={{ width: 16, height: 16, marginTop: 4, flexShrink: 0 }}
                  />

                  {/* Thumbnail */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.thumbnail_url} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4, flexShrink: 0, background: 'var(--surface-2)' }} />

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: 2 }}>
                      <span style={{
                        fontSize: '9px', padding: '1px 5px', borderRadius: 3,
                        background: (item.category || 'video') === 'graphic' ? 'rgba(59,130,246,0.2)' : 'rgba(168,85,247,0.2)',
                        color: (item.category || 'video') === 'graphic' ? '#60a5fa' : '#c084fc',
                        textTransform: 'uppercase', fontWeight: 700,
                      }}>
                        {(item.category || 'video') === 'graphic' ? 'GD' : 'VID'}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.title || 'Untitled'}
                      </span>
                    </div>

                    {/* Action row */}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: 6 }}>
                      <button
                        type="button"
                        onClick={() => togglePin(item.id, item.is_pinned, item.category || 'video')}
                        style={{
                          fontSize: '10px', padding: '2px 8px', borderRadius: 4, cursor: 'pointer',
                          background: item.is_pinned ? 'rgba(255,215,0,0.15)' : 'var(--surface-2)',
                          color: item.is_pinned ? '#ffd700' : 'var(--text-faint)',
                          border: item.is_pinned ? '1px solid rgba(255,215,0,0.4)' : '1px solid var(--border)',
                        }}
                      >
                        {item.is_pinned ? 'Pinned' : 'Pin'}
                      </button>
                      <button
                        type="button"
                        onClick={() => togglePublish(item.id, item.is_published)}
                        style={{
                          fontSize: '10px', padding: '2px 8px', borderRadius: 4, cursor: 'pointer', border: 'none',
                          background: item.is_published ? 'rgba(129,199,132,0.15)' : 'var(--surface-2)',
                          color: item.is_published ? '#81c784' : 'var(--text-faint)',
                        }}
                      >
                        {item.is_published ? 'Published' : 'Draft'}
                      </button>
                      <button className={styles.secondaryBtn} onClick={() => moveOrder(item.id, 'up')} disabled={idx === 0} style={{ fontSize: '10px', padding: '2px 6px', minHeight: 0 }}>↑</button>
                      <button className={styles.secondaryBtn} onClick={() => moveOrder(item.id, 'down')} disabled={idx === items.length - 1} style={{ fontSize: '10px', padding: '2px 6px', minHeight: 0 }}>↓</button>
                      <Link href={`/admin/results/${item.id}/edit`} className={styles.secondaryBtn} style={{ fontSize: '10px', padding: '2px 8px', minHeight: 0 }}>Edit</Link>
                      <button className={styles.dangerBtn} onClick={() => setDeleteId(item.id)} style={{ fontSize: '10px', padding: '2px 8px', minHeight: 0 }}>Hapus</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
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
