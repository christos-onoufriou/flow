'use client';

import React, { useState } from 'react';
import { useCanvasStore, Shape } from '@/store/canvasStore';
import { X, Check } from 'lucide-react';

interface ArtboardModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PLATFORM_SIZES: Record<string, { label: string; width: number; height: number; description?: string }[]> = {
    Instagram: [
        { label: 'Feed (Standard)', width: 1080, height: 1440, description: '3:4 ratio' },
        { label: 'Feed (Vertical)', width: 1080, height: 1350, description: '4:5 ratio' },
        { label: 'Feed (Square)', width: 1080, height: 1080, description: '1:1 ratio' },
        { label: 'Story', width: 1080, height: 1920, description: '9:16 ratio' },
        { label: 'Reel', width: 1080, height: 1920, description: '9:16 ratio' },
    ],
    Facebook: [
        { label: 'Feed (Square)', width: 1080, height: 1080, description: '1:1 ratio' },
        { label: 'Feed (Vertical)', width: 1080, height: 1350, description: '4:5 ratio' },
        { label: 'Shared Link', width: 1200, height: 630, description: '1.91:1 ratio' },
        { label: 'Story', width: 1080, height: 1920, description: '9:16 ratio' },
        { label: 'Reel', width: 1080, height: 1920, description: '9:16 ratio' },
    ],
    TikTok: [
        { label: 'In-Feed Video', width: 1080, height: 1920, description: '9:16 ratio' },
        { label: 'Photo Carousel', width: 1080, height: 1920, description: '9:16 ratio' },
        { label: 'Story', width: 1080, height: 1920, description: '9:16 ratio' },
    ],
    LinkedIn: [
        { label: 'Feed (Square)', width: 1200, height: 1200, description: '1:1 ratio' },
        { label: 'Feed (Vertical)', width: 1080, height: 1350, description: '4:5 ratio' },
        { label: 'Shared Link', width: 1200, height: 627 },
        { label: 'Video (Desktop)', width: 1920, height: 1080, description: '16:9 ratio' },
        { label: 'Video (Mobile)', width: 1080, height: 1350, description: '4:5 ratio' },
    ],
    YouTube: [
        { label: 'Standard Video', width: 1920, height: 1080, description: '16:9 ratio' },
        { label: '1440p', width: 2560, height: 1440, description: '16:9 ratio' },
        { label: '4K', width: 3840, height: 2160, description: '16:9 ratio' },
        { label: 'YouTube Shorts', width: 1080, height: 1920, description: '9:16 ratio' }
    ]
};
const PLATFORMS = ['LinkedIn', 'YouTube', 'Facebook', 'Instagram', 'TikTok'];

function getSafeAreaGuides(platform: string, label: string, width: number, height: number): Shape[] {
    const guides: Shape[] = [];
    const createGuide = (name: string, x: number, y: number, w: number, h: number, strokeColor: string): Shape => ({
        id: crypto.randomUUID(),
        type: 'rectangle',
        x, y, width: w, height: h,
        fill: 'transparent',
        stroke: strokeColor,
        strokeWidth: 2,
        name,
        locked: true,
        opacity: 0.8
    });

    if (platform === 'Instagram' && (label.includes('Story') || label.includes('Reel'))) {
        guides.push(createGuide('Safe Zone (IG)', 65, 250, 950, 1420, '#00ff00'));
    } else if (platform === 'Facebook') {
        if (label.includes('Story')) {
            guides.push(createGuide('Safe Zone (FB Story)', 65, 250, 950, 1420, '#00ff00'));
        } else if (label.includes('Reel')) {
            guides.push(createGuide('Safe Zone (FB Reel)', 65, 270, 950, 980, '#00ff00'));
            guides.push(createGuide('Meta Center-Square', 0, 420, 1080, 1080, '#00aaff'));
        }
    } else if (platform === 'TikTok' && (label.includes('In-Feed') || label.includes('Carousel') || label.includes('Story'))) {
        guides.push(createGuide('Safe Zone (TikTok)', 60, 108, 900, 1492, '#00ff00'));
    } else if (platform === 'YouTube' && label.includes('Short')) {
        guides.push(createGuide('Safe Zone (YT Shorts)', 0, 150, 930, 1320, '#00ff00'));
    } else if (platform === 'LinkedIn') {
        if (label.includes('Vertical') && width === 1080 && height === 1350) {
            guides.push(createGuide('Safe Zone (Vertical)', 100, 100, 880, 1150, '#00ff00'));
        } else if (label.includes('Banner') && width === 1584 && height === 396) {
            guides.push(createGuide('Safe Zone (Upper Right)', 792, 0, 792, 198, '#00ff00'));
        }
    }

    return guides;
}

export function ArtboardModal({ isOpen, onClose }: ArtboardModalProps) {
    const { addShape, offset, setOffset, setZoom, shapes } = useCanvasStore();
    const [selectedPlatform, setSelectedPlatform] = useState(PLATFORMS[0]);
    const [selectedRatio, setSelectedRatio] = useState(PLATFORM_SIZES[PLATFORMS[0]][0]);

    if (!isOpen) return null;

    const handleCreate = () => {
        // Find the last created artboard to position next to
        const existingArtboards = shapes.filter(s => s.type === 'artboard');
        const lastArtboard = existingArtboards.length > 0 ? existingArtboards[existingArtboards.length - 1] : null;

        let x, y;

        if (lastArtboard) {
            // Place 40px to the right, aligned at top
            x = lastArtboard.x + lastArtboard.width + 40;
            y = lastArtboard.y;
        } else {
            // Default: Place near center of view
            x = -offset.x + 100;
            y = -offset.y + 100;
        }

        const newArtboard: Shape = {
            id: crypto.randomUUID(),
            type: 'artboard',
            x,
            y,
            width: selectedRatio.width,
            height: selectedRatio.height,
            fill: '#ffffff',
            children: getSafeAreaGuides(selectedPlatform, selectedRatio.label, selectedRatio.width, selectedRatio.height)
        };
        addShape(newArtboard);

        // Auto-zoom logic
        // Layout dimensions from AppShell.module.css
        const leftSidebarWidth = 240;
        const rightSidebarWidth = 280;
        const headerHeight = 48;

        const viewportW = window.innerWidth - leftSidebarWidth - rightSidebarWidth;
        const viewportH = window.innerHeight - headerHeight;
        const padding = 60;

        // Calculate scale to fit
        const scaleX = (viewportW - padding * 2) / newArtboard.width;
        const scaleY = (viewportH - padding * 2) / newArtboard.height;
        const newZoom = Math.min(scaleX, scaleY, 2); // Cap max zoom

        // Calculate offset to center
        // The shape center in world coordinates
        const centerX = newArtboard.x + newArtboard.width / 2;
        const centerY = newArtboard.y + newArtboard.height / 2;

        // New offset calculation
        const newOffsetX = (viewportW / 2) - (centerX * newZoom);
        const newOffsetY = (viewportH / 2) - (centerY * newZoom);

        setZoom(newZoom);
        setOffset({ x: newOffsetX, y: newOffsetY });

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
                            onClick={() => {
                                setSelectedPlatform(platform);
                                setSelectedRatio(PLATFORM_SIZES[platform][0]);
                            }}
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
                    gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                    gap: 'var(--space-4)',
                    marginBottom: 'var(--space-6)',
                    maxHeight: '40vh',
                    overflowY: 'auto',
                    paddingRight: 'var(--space-2)'
                }}>
                    {PLATFORM_SIZES[selectedPlatform].map(ratio => {
                        const isSelected = selectedRatio.label === ratio.label && selectedRatio.width === ratio.width && selectedRatio.height === ratio.height;
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
                                key={`${ratio.label}-${ratio.width}x${ratio.height}`}
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
                                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, textAlign: 'center', lineHeight: 1.2, marginBottom: '4px' }}>{ratio.label}</span>
                                {ratio.description && (
                                    <span style={{ fontSize: '0.7rem', color: 'hsl(var(--color-text-muted))', marginBottom: '2px' }}>{ratio.description}</span>
                                )}
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
