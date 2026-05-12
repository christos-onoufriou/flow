'use client';

import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { useCanvasStore } from '@/store/canvasStore';

interface SaveModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SaveModal({ isOpen, onClose }: SaveModalProps) {
    const { saveProject, currentProjectName } = useCanvasStore();
    const [name, setName] = useState(currentProjectName || '');
    const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    if (!isOpen) return null;

    const handleSave = async () => {
        const trimmed = name.trim();
        if (!trimmed) return;

        setStatus('saving');
        const result = await saveProject(trimmed);

        if (result.success) {
            setStatus('saved');
            setTimeout(() => {
                setStatus('idle');
                onClose();
            }, 1200);
        } else {
            setStatus('error');
            setErrorMsg(result.error || 'Unknown error');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') onClose();
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
                width: '400px',
                maxWidth: '90vw',
                padding: 'var(--space-6)',
                boxShadow: 'var(--shadow-md)',
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Save size={18} /> Save Project
                    </h2>
                    <button onClick={onClose} style={{ padding: 'var(--space-1)', color: 'hsl(var(--color-text-muted))' }}>
                        <X size={18} />
                    </button>
                </div>

                {/* Name Input */}
                <div style={{ marginBottom: 'var(--space-4)' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: 'hsl(var(--color-text-muted))', marginBottom: '6px' }}>
                        Project Name
                    </label>
                    <input
                        autoFocus
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="e.g. LinkedIn Campaign Q2"
                        style={{
                            width: '100%',
                            background: 'hsl(var(--color-bg-app))',
                            border: '1px solid hsl(var(--color-border))',
                            borderRadius: 'var(--radius-md)',
                            color: 'hsl(var(--color-text-primary))',
                            padding: '8px 12px',
                            fontSize: '14px',
                            outline: 'none',
                            boxSizing: 'border-box',
                        }}
                    />
                    <p style={{ fontSize: '11px', color: 'hsl(var(--color-text-muted))', marginTop: '4px' }}>
                        Saved to <code style={{ fontSize: '10px' }}>src/projects/{name.trim() || 'project-name'}.flow</code>
                    </p>
                </div>

                {status === 'error' && (
                    <p style={{ fontSize: '12px', color: 'hsl(0, 80%, 60%)', marginBottom: 'var(--space-4)' }}>
                        ⚠ {errorMsg}
                    </p>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button onClick={onClose} style={{
                        padding: '8px 16px', borderRadius: 'var(--radius-md)',
                        border: '1px solid hsl(var(--color-border))',
                        background: 'hsl(var(--color-bg-app))',
                        color: 'hsl(var(--color-text-primary))',
                        fontSize: '13px', cursor: 'pointer',
                    }}>
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!name.trim() || status === 'saving'}
                        style={{
                            padding: '8px 20px', borderRadius: 'var(--radius-md)',
                            background: status === 'saved' ? 'hsl(142, 71%, 45%)' : 'hsl(var(--color-accent))',
                            color: 'white', fontSize: '13px', fontWeight: 500,
                            cursor: name.trim() ? 'pointer' : 'not-allowed',
                            opacity: name.trim() ? 1 : 0.5,
                            transition: 'background 0.2s ease',
                            border: 'none',
                        }}
                    >
                        {status === 'saving' ? 'Saving…' : status === 'saved' ? '✓ Saved!' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
}
