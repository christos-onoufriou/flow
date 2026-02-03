'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AssetsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CATEGORIES = ['Logos', 'Icons'];

export function AssetsModal({ isOpen, onClose }: AssetsModalProps) {
    const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
        }} onClick={onClose}>
            <div style={{
                backgroundColor: 'hsl(var(--color-bg-panel))',
                border: '1px solid hsl(var(--color-border))',
                borderRadius: 'var(--radius-lg)',
                width: '600px',
                maxWidth: '90vw',
                padding: 'var(--space-6)',
                boxShadow: 'var(--shadow-md)',
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-6)' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Assets</h2>
                    <button onClick={onClose} style={{ padding: 'var(--space-1)' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Categories Tabs */}
                <div className="flex" style={{ borderBottom: '1px solid hsl(var(--color-border))', marginBottom: 'var(--space-6)', gap: 'var(--space-2)' }}>
                    {CATEGORIES.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            style={{
                                padding: 'var(--space-2) var(--space-4)',
                                borderBottom: selectedCategory === category ? '2px solid hsl(var(--color-accent))' : '2px solid transparent',
                                color: selectedCategory === category ? 'hsl(var(--color-text-primary))' : 'hsl(var(--color-text-muted))',
                                fontWeight: 500,
                                marginBottom: '-1px'
                            }}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Placeholders Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 'var(--space-4)',
                    marginBottom: 'var(--space-6)'
                }}>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div
                            key={i}
                            style={{
                                aspectRatio: '1/1',
                                border: '1px solid hsl(var(--color-border))',
                                borderRadius: 'var(--radius-md)',
                                backgroundColor: 'hsl(var(--color-bg-app))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'hsl(var(--color-text-muted))',
                                fontSize: 'var(--text-xs)'
                            }}
                        >
                            Placeholder
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="flex justify-end items-center">
                    <button
                        onClick={onClose}
                        style={{
                            backgroundColor: 'hsl(var(--color-accent))',
                            color: 'white',
                            padding: 'var(--space-2) var(--space-4)',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: 500
                        }}
                    >
                        Close
                    </button>
                </div>

            </div>
        </div>
    );
}
