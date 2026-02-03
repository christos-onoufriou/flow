'use client';

import React, { useState } from 'react';
import { useCanvasStore, Shape } from '@/store/canvasStore';
import { X, Check } from 'lucide-react';

interface ArtboardModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PLATFORMS = ['Instagram', 'LinkedIn', 'Facebook', 'TikTok', 'YouTube'];

const RATIOS = [
    { label: '1:1', width: 1080, height: 1080 },
    { label: '3:4', width: 1080, height: 1440 },
    { label: '4:3', width: 1440, height: 1080 },
    { label: '3:2', width: 1440, height: 960 },
    { label: '2:3', width: 960, height: 1440 },
    { label: '9:16', width: 1080, height: 1920 },
    { label: '16:9', width: 1920, height: 1080 },
];

export function ArtboardModal({ isOpen, onClose }: ArtboardModalProps) {
    const { addShape, offset, setOffset } = useCanvasStore();
    const [selectedPlatform, setSelectedPlatform] = useState('Instagram');
    const [selectedRatio, setSelectedRatio] = useState(RATIOS[0]);

    if (!isOpen) return null;

    const handleCreate = () => {
        const newArtboard: Shape = {
            id: crypto.randomUUID(),
            type: 'artboard',
            x: -offset.x + 100, // Place near center of view approx
            y: -offset.y + 100,
            width: selectedRatio.width,
            height: selectedRatio.height,
            fill: '#ffffff',
            children: []
        };
        addShape(newArtboard);
        onClose();
    };

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
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Create Artboard</h2>
                    <button onClick={onClose} style={{ padding: 'var(--space-1)' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Platforms Tabs */}
                <div className="flex" style={{ borderBottom: '1px solid hsl(var(--color-border))', marginBottom: 'var(--space-6)', gap: 'var(--space-2)' }}>
                    {PLATFORMS.map(platform => (
                        <button
                            key={platform}
                            onClick={() => setSelectedPlatform(platform)}
                            style={{
                                padding: 'var(--space-2) var(--space-4)',
                                borderBottom: selectedPlatform === platform ? '2px solid hsl(var(--color-accent))' : '2px solid transparent',
                                color: selectedPlatform === platform ? 'hsl(var(--color-text-primary))' : 'hsl(var(--color-text-muted))',
                                fontWeight: 500,
                                marginBottom: '-1px'
                            }}
                        >
                            {platform}
                        </button>
                    ))}
                </div>

                {/* Ratios Grid */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
                    gap: 'var(--space-4)',
                    marginBottom: 'var(--space-6)'
                }}>
                    {RATIOS.map(ratio => {
                        const isSelected = selectedRatio.label === ratio.label;
                        // Calculate visual aspect ratio for the preview box
                        const maxDim = 60;
                        const ar = ratio.width / ratio.height;
                        let w = maxDim;
                        let h = maxDim;
                        if (ar > 1) {
                            h = maxDim / ar;
                        } else {
                            w = maxDim * ar;
                        }

                        return (
                            <button
                                key={ratio.label}
                                onClick={() => setSelectedRatio(ratio)}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    padding: 'var(--space-3)',
                                    borderRadius: 'var(--radius-md)',
                                    border: isSelected ? '1px solid hsl(var(--color-accent))' : '1px solid hsl(var(--color-border))',
                                    backgroundColor: isSelected ? 'hsla(var(--color-accent) / 0.1)' : 'transparent',
                                    transition: 'all 0.2s',
                                }}
                            >
                                <div style={{ 
                                    width: '64px', 
                                    height: '64px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    marginBottom: 'var(--space-2)' 
                                }}>
                                    <div style={{
                                        width: `${w}px`,
                                        height: `${h}px`,
                                        border: '2px solid currentColor',
                                        borderRadius: '2px',
                                        opacity: 0.8
                                    }} />
                                </div>
                                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{ratio.label}</span>
                                <span style={{ fontSize: '0.7rem', color: 'hsl(var(--color-text-muted))' }}>{ratio.width}x{ratio.height}</span>
                            </button>
                        )
                    })}
                </div>

                {/* Footer / Create Button */}
                <div className="flex justify-between items-center">
                   <div style={{ fontSize: 'var(--text-sm)', color: 'hsl(var(--color-text-muted))' }}>
                        Selected: {selectedRatio.width} x {selectedRatio.height} px
                   </div>
                   <button 
                        onClick={handleCreate}
                        style={{
                            backgroundColor: 'hsl(var(--color-accent))',
                            color: 'white',
                            padding: 'var(--space-2) var(--space-4)',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: 500
                        }}
                   >
                    Create Artboard
                   </button>
                </div>

            </div>
        </div>
    );
}
