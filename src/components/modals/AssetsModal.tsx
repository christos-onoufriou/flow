'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useCanvasStore } from '@/store/canvasStore';
import { ASSET_LIBRARY } from '@/data/assets';

interface AssetsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CATEGORIES = Object.keys(ASSET_LIBRARY);

export function AssetsModal({ isOpen, onClose }: AssetsModalProps) {
    const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0] || 'Logos');
    const { addShape, offset, zoom } = useCanvasStore();

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

                {/* Assets Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 'var(--space-4)',
                    marginBottom: 'var(--space-6)',
                    maxHeight: '60vh',
                    overflowY: 'auto'
                }}>
                    {(ASSET_LIBRARY[selectedCategory] || []).map((asset) => (
                        <div
                            key={asset.id}
                            onClick={() => {
                                // Default drop in center of current view
                                // Using offset and zoom to calculate a rough center
                                // Assuming typical viewport is around 1000x800, center is ~500x400
                                const targetX = (500 - offset.x) / zoom;
                                const targetY = (400 - offset.y) / zoom;

                                addShape({
                                    id: crypto.randomUUID(),
                                    type: 'svg',
                                    x: targetX,
                                    y: targetY,
                                    width: 200,
                                    height: 200,
                                    fill: '#000000', // Default fill that can be changed
                                    svgContent: asset.content
                                });
                                onClose();
                            }}
                            style={{
                                position: 'relative',
                                aspectRatio: '1/1',
                                border: '1px solid hsl(var(--color-border))',
                                borderRadius: 'var(--radius-md)',
                                backgroundColor: 'hsl(var(--color-bg-app))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                padding: 'var(--space-2)',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'hsl(var(--color-accent))';
                                e.currentTarget.style.backgroundColor = 'hsl(var(--color-bg-panel))';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'hsl(var(--color-border))';
                                e.currentTarget.style.backgroundColor = 'hsl(var(--color-bg-app))';
                            }}
                            title={asset.name}
                        >
                            <div style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                fontSize: '0.65rem',
                                fontWeight: 600,
                                backgroundColor: 'hsl(var(--color-bg-panel))',
                                border: '1px solid hsl(var(--color-border))',
                                color: 'hsl(var(--color-text-secondary))',
                                padding: '2px 4px',
                                borderRadius: '4px',
                                opacity: 0.8
                            }}>
                                {asset.lang}
                            </div>
                            <div 
                                style={{ width: '80%', height: '80%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                dangerouslySetInnerHTML={{ __html: asset.content.replace(/<svg([^>]*)>/, '<svg$1 style="width: 100%; height: 100%;" preserveAspectRatio="xMidYMid meet">') }}
                            />
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
