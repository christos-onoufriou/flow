'use client';

import React from 'react';
import { X, Plus } from 'lucide-react';
import { useCanvasStore } from '@/store/canvasStore';

export function TabBar() {
    const { tabBar, activeTabId, switchTab, closeTab, newProject } = useCanvasStore();

    return (
        <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '2px',
            padding: '0 var(--space-4)',
            borderBottom: '1px solid hsl(var(--color-border))',
            backgroundColor: 'hsl(var(--color-bg-app))',
            overflowX: 'auto',
            flexShrink: 0,
            height: '36px',
        }}>
            {tabBar.map(tab => {
                const isActive = tab.id === activeTabId;
                return (
                    <div
                        key={tab.id}
                        onClick={() => switchTab(tab.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '0 10px 0 12px',
                            height: '32px',
                            cursor: 'pointer',
                            borderRadius: '6px 6px 0 0',
                            flexShrink: 0,
                            maxWidth: '200px',
                            backgroundColor: isActive ? 'hsl(var(--color-bg-panel))' : 'transparent',
                            borderTop: isActive ? '1px solid hsl(var(--color-border))' : '1px solid transparent',
                            borderLeft: isActive ? '1px solid hsl(var(--color-border))' : '1px solid transparent',
                            borderRight: isActive ? '1px solid hsl(var(--color-border))' : '1px solid transparent',
                            borderBottom: isActive ? '1px solid hsl(var(--color-bg-panel))' : 'none',
                            marginBottom: '-1px',
                            position: 'relative',
                        }}
                        title={tab.name}
                    >
                        {/* Dot indicator for unsaved */}
                        {!tab.filename && tab.name !== 'Untitled' && (
                            <span style={{
                                width: '6px', height: '6px', borderRadius: '50%',
                                backgroundColor: 'hsl(var(--color-accent))',
                                flexShrink: 0,
                            }} />
                        )}
                        <span style={{
                            fontSize: '12px',
                            fontWeight: isActive ? 500 : 400,
                            color: isActive ? 'hsl(var(--color-text-primary))' : 'hsl(var(--color-text-muted))',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flex: 1,
                        }}>
                            {tab.name}
                        </span>
                        <button
                            onClick={e => { e.stopPropagation(); closeTab(tab.id); }}
                            title="Close tab"
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: '16px', height: '16px',
                                borderRadius: '3px',
                                background: 'transparent',
                                border: 'none',
                                color: 'hsl(var(--color-text-muted))',
                                cursor: 'pointer',
                                flexShrink: 0,
                                padding: 0,
                                opacity: isActive ? 1 : 0,
                                transition: 'opacity 0.1s',
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLElement).style.opacity = '1';
                                (e.currentTarget as HTMLElement).style.background = 'hsl(var(--color-border))';
                                (e.currentTarget as HTMLElement).style.color = 'hsl(var(--color-text-primary))';
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.opacity = isActive ? '1' : '0';
                                (e.currentTarget as HTMLElement).style.background = 'transparent';
                                (e.currentTarget as HTMLElement).style.color = 'hsl(var(--color-text-muted))';
                            }}
                        >
                            <X size={10} />
                        </button>
                    </div>
                );
            })}

            {/* New tab button */}
            <button
                onClick={() => newProject()}
                title="New tab"
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '28px', height: '28px',
                    borderRadius: '6px',
                    background: 'transparent',
                    border: 'none',
                    color: 'hsl(var(--color-text-muted))',
                    cursor: 'pointer',
                    flexShrink: 0,
                    marginLeft: '2px',
                    alignSelf: 'center',
                    transition: 'background 0.15s ease, color 0.15s ease',
                }}
                onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'hsl(var(--color-border))';
                    (e.currentTarget as HTMLElement).style.color = 'hsl(var(--color-text-primary))';
                }}
                onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                    (e.currentTarget as HTMLElement).style.color = 'hsl(var(--color-text-muted))';
                }}
            >
                <Plus size={14} />
            </button>
        </div>
    );
}
