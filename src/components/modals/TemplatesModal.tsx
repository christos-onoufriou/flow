'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

import { useCanvasStore, Shape } from "@/store/canvasStore";

interface TemplatesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CATEGORIES = ['LinkedIn', 'YouTube', 'Facebook', 'Instagram', 'TikTok'];

export function TemplatesModal({ isOpen, onClose }: TemplatesModalProps) {
    const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
    const { templates, addShape, offset, zoom } = useCanvasStore();

    if (!isOpen) return null;

    const filteredTemplates = templates.filter(t => t.platform === selectedCategory);

    const handleTemplateClick = (template: any) => {
        // Clone and re-ID recursively
        const cloneShape = (s: Shape): Shape => {
            const newId = crypto.randomUUID();
            const children = s.children?.map(child => cloneShape(child));
            return { ...s, id: newId, children };
        };

        const artboard = cloneShape(template.shapes[0]);

        // Place it centered in the current viewport
        const viewportCenterX = (window.innerWidth / 2 - offset.x) / zoom;
        const viewportCenterY = (window.innerHeight / 2 - offset.y) / zoom;

        artboard.x = viewportCenterX - artboard.width / 2;
        artboard.y = viewportCenterY - artboard.height / 2;

        addShape(artboard);
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
                width: '640px',
                maxWidth: '90vw',
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                padding: 'var(--space-6)',
                boxShadow: 'var(--shadow-md)',
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexShrink: 0 }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>NBG Templates</h2>
                    <button onClick={onClose} style={{ padding: 'var(--space-1)' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Categories Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid hsl(var(--color-border))', marginBottom: 'var(--space-6)', gap: 'var(--space-2)', flexShrink: 0 }}>
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

                {/* Templates Grid */}
                <div style={{ overflowY: 'auto', flex: 1 }}>
                    {filteredTemplates.length === 0 ? (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '48px var(--space-4)',
                            color: 'hsl(var(--color-text-muted))',
                            gap: 'var(--space-2)'
                        }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity={0.4}>
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <path d="M3 9h18M9 21V9" />
                            </svg>
                            <p style={{ fontSize: 'var(--text-sm)', margin: 0 }}>No templates saved for {selectedCategory}</p>
                            <p style={{ fontSize: '11px', margin: 0, opacity: 0.7, textAlign: 'center' }}>
                                Select an artboard and use the Template section in the Properties panel to save one.
                            </p>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: 'var(--space-4)',
                            paddingBottom: 'var(--space-4)'
                        }}>
                            {filteredTemplates.map((template) => (
                                <TemplateCard
                                    key={template.id}
                                    template={template}
                                    onClick={() => handleTemplateClick(template)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, paddingTop: 'var(--space-4)', borderTop: '1px solid hsl(var(--color-border))' }}>
                    <span style={{ fontSize: '11px', color: 'hsl(var(--color-text-muted))' }}>
                        {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} in {selectedCategory}
                    </span>
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

function TemplateCard({ template, onClick }: { template: any, onClick: () => void }) {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                border: `1px solid ${hovered ? 'hsl(var(--color-accent))' : 'hsl(var(--color-border))'}`,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'hsl(var(--color-bg-app))',
                cursor: 'pointer',
                overflow: 'hidden',
                position: 'relative',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                boxShadow: hovered ? '0 0 0 2px hsl(var(--color-accent) / 0.2)' : 'none',
            }}
        >
            {/* Thumbnail */}
            <div style={{ aspectRatio: '4/3', overflow: 'hidden', backgroundColor: 'hsl(var(--color-bg-app))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {template.thumbnail ? (
                    <img
                        src={template.thumbnail}
                        alt={template.name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                ) : (
                    <div style={{ color: 'hsl(var(--color-text-muted))', fontSize: '11px' }}>
                        No preview
                    </div>
                )}
            </div>

            {/* Info */}
            <div style={{ padding: '8px 10px', borderTop: '1px solid hsl(var(--color-border))' }}>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: 500, color: 'hsl(var(--color-text-primary))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {template.name}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: '10px', color: 'hsl(var(--color-text-muted))' }}>
                    {template.width} × {template.height}px{template.business ? ` · ${template.business}` : ''}
                </p>
            </div>

            {/* Hover overlay */}
            {hovered && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: '53px', // above the info bar
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'hsl(var(--color-accent) / 0.08)'
                }}>
                    <span style={{
                        background: 'hsl(var(--color-accent))',
                        color: 'white',
                        padding: '4px 14px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 500
                    }}>
                        Add to Canvas
                    </span>
                </div>
            )}
        </div>
    );
}
