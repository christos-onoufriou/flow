'use client';

import React, { useState, useEffect } from 'react';
import { X, FolderOpen, Trash2, FileText } from 'lucide-react';
import { useCanvasStore } from '@/store/canvasStore';

interface ProjectMeta {
    filename: string;
    name: string;
    savedAt: string;
    shapeCount: number;
}

interface OpenModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function OpenModal({ isOpen, onClose }: OpenModalProps) {
    const { loadProject } = useCanvasStore();
    const [projects, setProjects] = useState<ProjectMeta[]>([]);
    const [loading, setLoading] = useState(false);
    const [opening, setOpening] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [error, setError] = useState('');

    const fetchProjects = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/projects');
            if (res.ok) setProjects(await res.json());
        } catch {
            setError('Could not load projects.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) fetchProjects();
    }, [isOpen]);

    if (!isOpen) return null;

    const handleOpen = async (filename: string) => {
        setOpening(filename);
        const ok = await loadProject(filename);
        if (ok) {
            onClose();
        } else {
            setError(`Failed to open "${filename}".`);
            setOpening(null);
        }
    };

    const handleDelete = async (e: React.MouseEvent, filename: string) => {
        e.stopPropagation();
        if (!confirm(`Delete "${filename.replace('.flow', '')}"? This cannot be undone.`)) return;
        setDeleting(filename);
        await fetch(`/api/projects/${encodeURIComponent(filename)}`, { method: 'DELETE' });
        setProjects(prev => prev.filter(p => p.filename !== filename));
        setDeleting(null);
    };

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={onClose}>
            <div style={{
                backgroundColor: 'hsl(var(--color-bg-panel))',
                border: '1px solid hsl(var(--color-border))',
                borderRadius: 'var(--radius-lg)',
                width: '560px',
                maxWidth: '90vw',
                maxHeight: '75vh',
                display: 'flex',
                flexDirection: 'column',
                padding: 'var(--space-6)',
                boxShadow: 'var(--shadow-md)',
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexShrink: 0 }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FolderOpen size={18} /> Open Project
                    </h2>
                    <button onClick={onClose} style={{ padding: 'var(--space-1)', color: 'hsl(var(--color-text-muted))' }}>
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {loading && (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'hsl(var(--color-text-muted))' }}>
                            Loading projects…
                        </div>
                    )}

                    {!loading && error && (
                        <p style={{ color: 'hsl(0, 80%, 60%)', fontSize: '13px' }}>{error}</p>
                    )}

                    {!loading && projects.length === 0 && !error && (
                        <div style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            padding: '48px', color: 'hsl(var(--color-text-muted))', gap: '8px'
                        }}>
                            <FileText size={36} opacity={0.35} />
                            <p style={{ margin: 0, fontSize: '14px' }}>No saved projects yet</p>
                            <p style={{ margin: 0, fontSize: '11px', opacity: 0.7 }}>
                                Use Save to create your first .flow file.
                            </p>
                        </div>
                    )}

                    {!loading && projects.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {projects.map(p => (
                                <div
                                    key={p.filename}
                                    onClick={() => handleOpen(p.filename)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '12px',
                                        padding: '12px 14px',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid hsl(var(--color-border))',
                                        background: opening === p.filename
                                            ? 'hsl(var(--color-accent) / 0.1)'
                                            : 'hsl(var(--color-bg-app))',
                                        cursor: 'pointer',
                                        transition: 'background 0.15s ease',
                                    }}
                                    onMouseEnter={e => { if (opening !== p.filename) (e.currentTarget as HTMLElement).style.background = 'hsl(var(--color-bg-panel))'; }}
                                    onMouseLeave={e => { if (opening !== p.filename) (e.currentTarget as HTMLElement).style.background = 'hsl(var(--color-bg-app))'; }}
                                >
                                    <FileText size={22} style={{ color: 'hsl(var(--color-accent))', flexShrink: 0 }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 500, color: 'hsl(var(--color-text-primary))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {p.name}
                                        </p>
                                        <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'hsl(var(--color-text-muted))' }}>
                                            {formatDate(p.savedAt)} · {p.shapeCount} shape{p.shapeCount !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                        {opening === p.filename && (
                                            <span style={{ fontSize: '11px', color: 'hsl(var(--color-accent))' }}>Opening…</span>
                                        )}
                                        <button
                                            onClick={e => handleDelete(e, p.filename)}
                                            disabled={deleting === p.filename}
                                            title="Delete project"
                                            style={{
                                                padding: '4px', background: 'transparent', border: 'none',
                                                color: 'hsl(var(--color-text-muted))', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center',
                                                opacity: deleting === p.filename ? 0.4 : 0.6,
                                            }}
                                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'hsl(0, 80%, 60%)'}
                                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'hsl(var(--color-text-muted))'}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ flexShrink: 0, paddingTop: 'var(--space-4)', marginTop: 'var(--space-4)', borderTop: '1px solid hsl(var(--color-border))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'hsl(var(--color-text-muted))' }}>
                        {projects.length} project{projects.length !== 1 ? 's' : ''} · <code style={{ fontSize: '10px' }}>src/projects/</code>
                    </span>
                    <button onClick={onClose} style={{
                        padding: '8px 16px', borderRadius: 'var(--radius-md)',
                        border: '1px solid hsl(var(--color-border))',
                        background: 'hsl(var(--color-bg-app))',
                        color: 'hsl(var(--color-text-primary))',
                        fontSize: '13px', cursor: 'pointer',
                    }}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
