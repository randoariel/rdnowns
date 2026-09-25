'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../admin.module.css';

interface SoftwareSkill {
  id: string;
  name: string;
  svg_content: string;
  sort_order: number;
}

export default function SoftwareSkillsAdminPage() {
  const [skills, setSkills] = useState<SoftwareSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function loadSkills() {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/software-skills');
      if (res.ok) {
        const data = await res.json();
        setSkills(data);
      }
    } catch {
      setError('Gagal mengambil data software skill.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSkills();
  }, []);

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.name.toLowerCase().endsWith('.svg') && selected.type !== 'image/svg+xml') {
      setError('Harap pilih file berekstensi .svg (1:1 ratio direkomendasikan)');
      return;
    }

    setFile(selected);
    setError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      setFilePreview(event.target?.result as string);
    };
    reader.readAsText(selected);

    if (!name) {
      const autoName = selected.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setName(autoName);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!file && !filePreview) {
      setError('Pilih file SVG 1:1 terlebih dahulu.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      if (file) {
        formData.append('file', file);
      }

      const res = await fetch('/api/admin/software-skills', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal menambahkan logo');
        return;
      }

      setSuccess(`Logo ${data.name} berhasil ditambahkan!`);
      setName('');
      setFile(null);
      setFilePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      loadSkills();
    } catch {
      setError('Terjadi kendala saat upload SVG.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, skillName: string) {
    if (!confirm(`Hapus logo ${skillName}?`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/software-skills?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSuccess(`Logo ${skillName} berhasil dihapus.`);
        loadSkills();
      } else {
        setError('Gagal menghapus logo.');
      }
    } catch {
      setError('Terjadi kesalahan saat menghapus.');
    } finally {
      setDeletingId(null);
    }
  }

  async function handleMove(index: number, direction: 'up' | 'down') {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= skills.length) return;

    const reordered = [...skills];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    setSkills(reordered);

    try {
      await fetch('/api/admin/software-skills', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: reordered.map(s => s.id) }),
      });
    } catch {
      // rollback if fail
      loadSkills();
    }
  }

  return (
    <div className={styles.adminLayout}>
      <aside className={styles.adminSidebar}>
        <div className={styles.adminSidebarBrand}>RDN Admin</div>
        <nav className={styles.adminNav} aria-label="Admin navigation">
          <Link href="/admin" className={styles.adminNavLink}>Overview</Link>
          <Link href="/admin/results" className={styles.adminNavLink}>Results</Link>
          <Link href="/admin/skills" className={`${styles.adminNavLink} ${styles.adminNavLinkActive}`}>Software Skills</Link>
          <Link href="/admin/pricing" className={styles.adminNavLink}>Pricing</Link>
          <Link href="/admin/instagram" className={styles.adminNavLink}>Instagram</Link>
          <Link href="/admin/settings" className={styles.adminNavLink}>Settings</Link>
        </nav>
        <LogoutBtn />
      </aside>

      <main className={styles.adminContent}>
        <h1 className={styles.adminPageTitle}>Software Skills (macOS Dock Carousel)</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-6)' }}>
          Kelola logo 1:1 software yang Anda kuasai. Logo ini akan berputar otomatis tanpa henti (infinity loop ke arah kiri) di bagian paling bawah Section Result dengan tampilan ala macOS Dock.
        </p>

        {/* Form Tambah SVG */}
        <div style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6)',
          marginBottom: 'var(--space-7)',
        }}>
          <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, color: 'var(--text)', marginBottom: 'var(--space-4)' }}>
            + Tambah Logo Software (SVG 1:1)
          </h2>

          <form onSubmit={handleAdd} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="skill-name" className={styles.label}>Nama Software</label>
              <input
                id="skill-name"
                type="text"
                className={styles.input}
                placeholder="Contoh: Premiere Pro, DaVinci, Blender"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="skill-file" className={styles.label}>Upload File SVG (Ratio 1:1)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Pilih File SVG
                </button>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-faint)' }}>
                  {file ? file.name : 'Belum ada file dipilih'}
                </span>
              </div>
              <input
                ref={fileInputRef}
                id="skill-file"
                type="file"
                accept=".svg,image/svg+xml"
                style={{ display: 'none' }}
                onChange={handleFileSelected}
              />
            </div>

            {/* Preview Box */}
            {filePreview && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-4)',
                padding: 'var(--space-4)',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)'
              }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0, 0, 0, 0.4)',
                    borderRadius: 14,
                    padding: 8,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                  dangerouslySetInnerHTML={{ __html: filePreview }}
                />
                <div>
                  <div style={{ color: 'var(--text)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{name || 'Preview Logo'}</div>
                  <div style={{ color: 'var(--text-faint)', fontSize: 'var(--font-size-xs)' }}>SVG 1:1 siap disimpan</div>
                </div>
              </div>
            )}

            {error && <p className={styles.error} role="alert">{error}</p>}
            {success && <p className={styles.success} role="status">{success}</p>}

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={saving}
              style={{ alignSelf: 'flex-start' }}
            >
              {saving ? 'Menyimpan...' : 'Upload & Tambahkan ke Dock'}
            </button>
          </form>
        </div>

        {/* List Software yang Ada */}
        <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, color: 'var(--text)', marginBottom: 'var(--space-4)' }}>
          Daftar Software ({skills.length})
        </h2>

        {loading ? (
          <p style={{ color: 'var(--text-faint)' }}>Memuat software skills...</p>
        ) : skills.length === 0 ? (
          <p style={{ color: 'var(--text-faint)' }}>Belum ada software skill. Silakan upload SVG di atas.</p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 'var(--space-4)',
          }}>
            {skills.map((skill, idx) => (
              <div
                key={skill.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 10,
                      background: 'rgba(0, 0, 0, 0.4)',
                      padding: 6,
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                    dangerouslySetInnerHTML={{ __html: skill.svg_content }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 'var(--font-size-sm)' }}>
                      {skill.name}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-faint)' }}>
                      Urutan: {idx + 1}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                  <button
                    className={styles.secondaryBtn}
                    onClick={() => handleMove(idx, 'up')}
                    disabled={idx === 0}
                    title="Geser ke kiri"
                    style={{ padding: '4px 8px', minHeight: 30 }}
                  >
                    ←
                  </button>
                  <button
                    className={styles.secondaryBtn}
                    onClick={() => handleMove(idx, 'down')}
                    disabled={idx === skills.length - 1}
                    title="Geser ke kanan"
                    style={{ padding: '4px 8px', minHeight: 30 }}
                  >
                    →
                  </button>
                  <button
                    className={styles.dangerBtn}
                    onClick={() => handleDelete(skill.id, skill.name)}
                    disabled={deletingId === skill.id}
                    title="Hapus logo"
                    style={{ padding: '4px 8px', minHeight: 30 }}
                  >
                    {deletingId === skill.id ? '...' : 'Hapus'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
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
