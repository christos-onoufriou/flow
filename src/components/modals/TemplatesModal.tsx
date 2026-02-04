'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

import { useCanvasStore, Shape } from "@/store/canvasStore";

interface TemplatesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CATEGORIES = ['Instagram', 'LinkedIn', 'Facebook', 'TikTok', 'YouTube'];

export function TemplatesModal({ isOpen, onClose }: TemplatesModalProps) {
    const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
    const { templates, addShape } = useCanvasStore();

    if (!isOpen) return null;

    const filteredTemplates = templates.filter(t => t.platform === selectedCategory);

    // Fill up to 8 slots, mixing real templates with placeholders if needed
    // or just show templates + placeholders to fill grid? 
    // User requirement: "placed as an image in a placeholder".
    // Let's overlay templates on the grid.
    const displayItems = Array.from({ length: 8 }).map((_, i) => filteredTemplates[i] || null);

    const handleTemplateClick = (template: any) => {
        if (!template) return;

        // Clone and re-ID
        const cloneShape = (s: Shape): Shape => {
            const newId = crypto.randomUUID();
            const children = s.children?.map(child => cloneShape(child));
            return { ...s, id: newId, children };
        };

        const artboard = cloneShape(template.shapes[0]);
        // Offset slightly to avoid exact overlap if multiple added? 
        // Or just place at center? Store handles offset usually? 
        // Let's just add it. `addShape` usually puts it at 0,0 or we might want to offset based on viewport but that's complex.
        // We'll trust the saved coordinates for now, or maybe move it to appear in center of view.
        // For now, keep saved coordinates.

        artboard.x += 20; // Slight offset so user sees it's new
        artboard.y += 20;

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
                width: '600px',
                maxWidth: '90vw',
                padding: 'var(--space-6)',
                boxShadow: 'var(--shadow-md)',
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-6)' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Templates</h2>
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
                    {displayItems.map((template, i) => (
                        <div
                            key={template ? template.id : i}
                            onClick={() => handleTemplateClick(template)}
                            style={{
                                aspectRatio: '1/1',
                                border: '1px solid hsl(var(--color-border))',
                                borderRadius: 'var(--radius-md)',
                                backgroundColor: 'hsl(var(--color-bg-app))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'hsl(var(--color-text-muted))',
                                fontSize: 'var(--text-xs)',
                                cursor: template ? 'pointer' : 'default',
                                overflow: 'hidden',
                                position: 'relative'
                            }}
                        >
                            {template ? (
                                <img
                                    src={template.thumbnail}
                                    alt={template.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                />
                            ) : (
                                "Placeholder"
                            )}
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
