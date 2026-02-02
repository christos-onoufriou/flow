'use client';

import { useCanvasStore, Shape } from "@/store/canvasStore";
import { useState, useEffect } from "react";

export function LayersPanel() {
    const { shapes, selectedIds, setSelectedIds, removeShape, toggleVisibility, moveLayer } = useCanvasStore();
    const [expandedIds, setExpandedIds] = useState<string[]>([]);

    // DnD State
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [dragOverId, setDragOverId] = useState<string | null>(null);
    const [dropPosition, setDropPosition] = useState<'before' | 'after' | 'inside' | null>(null);

    // Auto-expand parents of selected items
    useEffect(() => {
        const parentsToExpand = new Set<string>();

        const checkChildren = (currentShapes: Shape[]): boolean => {
            let found = false;
            for (const shape of currentShapes) {
                if (selectedIds.includes(shape.id)) {
                    found = true;
                }
                if (shape.children && shape.children.length > 0) {
                    const childFound = checkChildren(shape.children);
                    if (childFound) {
                        parentsToExpand.add(shape.id);
                        found = true;
                    }
                }
            }
            return found;
        };

        checkChildren(shapes);

        if (parentsToExpand.size > 0) {
            setExpandedIds(prev => {
                const newIds = Array.from(parentsToExpand).filter(id => !prev.includes(id));
                if (newIds.length === 0) return prev;
                return [...prev, ...newIds];
            });
        }
    }, [selectedIds, shapes]);

    const handleSelect = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (e.shiftKey) {
            if (selectedIds.includes(id)) {
                setSelectedIds(selectedIds.filter(sid => sid !== id));
            } else {
                setSelectedIds([...selectedIds, id]);
            }
        } else {
            setSelectedIds([id]);
        }
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        removeShape(id);
    };

    const handleToggleVisibility = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        toggleVisibility(id);
    };

    const toggleExpansion = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    // DnD Handlers
    const handleDragStart = (e: React.DragEvent, id: string) => {
        e.stopPropagation();
        setDraggingId(id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, id: string, hasChildren: boolean) => {
        e.stopPropagation();
        e.preventDefault(); // Allow Drop

        if (draggingId === id) return; // Can't drop on self

        setDragOverId(id);

        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const y = e.clientY - rect.top;
        const height = rect.height;

        // Logic:
        // Top 25% -> Before
        // Bottom 25% -> After
        // Middle 50% -> Inside (if container) OR After (if not container)
        // Actually simpler: Top 50% -> Before, Bottom 50% -> After.
        // Special case: If it's a container and we hover over the name precisely, maybe inside?
        // Let's force "Inside" only if we hover strictly the middle AND it accepts children.

        if (hasChildren || expandedIds.includes(id)) { // Treat expanded items as containers? Or just check type?
            // For Artboards/Groups, allow 'inside'
            if (y < height * 0.25) {
                setDropPosition('before');
            } else if (y > height * 0.75) {
                setDropPosition('after');
            } else {
                setDropPosition('inside');
            }
        } else {
            if (y < height * 0.5) {
                setDropPosition('before');
            } else {
                setDropPosition('after');
            }
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.stopPropagation();
        // Only clear if we leave the actual Item? This is tricky with nesting.
        // We'll trust DragOver updates.
    };

    const handleDrop = (e: React.DragEvent, targetId: string) => {
        e.stopPropagation();
        e.preventDefault();

        if (draggingId && draggingId !== targetId && dropPosition) {
            // Need to reverse logic because visual list is Reversed (Top = Front)
            // If I drop "Above" visually, I mean "Front" (After in array).
            // If I drop "Below" visually, I mean "Back" (Before in array).

            // Wait, shapes are rendered `reversedShapes.map`.
            // So index 0 of render is index N of array.
            // If I drop BEFORE index 0 (Visual Top), I want it at index N+1?

            // Let's map 'before'/'after' (visual) to 'after'/'before' (array logic).
            // Visual 'Before' (Above) -> Array: Higher Index (After).
            // Visual 'After' (Below) -> Array: Lower Index (Before).

            // Store `moveLayer` expects 'before'/'after' relative to array index?
            // `insertRelative` impl: 'before' = splice(index, 0), 'after' = splice(index+1, 0).
            // 'before' means "Lower Index".

            let storePosition = dropPosition;
            if (dropPosition === 'before') storePosition = 'after'; // Visual Above = Array After (Front)
            else if (dropPosition === 'after') storePosition = 'before'; // Visual Below = Array Before (Back)

            moveLayer(draggingId, targetId, storePosition);
        }

        setDraggingId(null);
        setDragOverId(null);
        setDropPosition(null);
    };


    // Recursive component
    const LayerItem = ({ shape, depth }: { shape: Shape, depth: number }) => {
        const isSelected = selectedIds.includes(shape.id);
        const hasChildren = shape.children && shape.children.length > 0;
        const isExpanded = expandedIds.includes(shape.id);
        const isDragOver = dragOverId === shape.id;

        // Visual feedback style
        let borderStyle = {};
        if (isDragOver && draggingId !== shape.id) {
            if (dropPosition === 'before') borderStyle = { borderTop: '2px solid hsl(var(--color-accent))' };
            else if (dropPosition === 'after') borderStyle = { borderBottom: '2px solid hsl(var(--color-accent))' };
            else if (dropPosition === 'inside') borderStyle = { border: '2px solid hsl(var(--color-accent))', borderRadius: '4px' };
        }

        return (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, shape.id)}
                    onDragOver={(e) => handleDragOver(e, shape.id, shape.type === 'artboard' || shape.type === 'group')}
                    onDrop={(e) => handleDrop(e, shape.id)}
                    onClick={(e) => handleSelect(shape.id, e)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px',
                        paddingLeft: `${8 + depth * 12}px`, // Indentation
                        marginBottom: '2px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: isSelected ? 'hsl(var(--color-accent))' : (isDragOver && dropPosition === 'inside' ? 'hsl(var(--color-accent) / 0.1)' : 'transparent'),
                        color: isSelected ? 'hsl(var(--color-accent-fg))' : 'hsl(var(--color-text-secondary))',
                        cursor: 'grab',
                        fontSize: 'var(--text-sm)',
                        userSelect: 'none',
                        ...borderStyle
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* Expansion Arrow */}
                        <button
                            onClick={(e) => toggleExpansion(shape.id, e)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '0',
                                width: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: isSelected ? 'inherit' : 'hsl(var(--color-text-muted))',
                                visibility: hasChildren ? 'visible' : 'hidden', // Hide if no children
                                transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                transition: 'transform 0.1s ease'
                            }}
                        >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                        </button>

                        <button
                            onClick={(e) => handleToggleVisibility(shape.id, e)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '2px',
                                display: 'flex',
                                color: isSelected ? 'inherit' : 'hsl(var(--color-text-muted))',
                                opacity: shape.visible === false ? 0.5 : 1
                            }}
                            title={shape.visible === false ? "Show" : "Hide"}
                        >
                            {shape.visible === false ? (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                            ) : (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                            )}
                        </button>
                        {/* Icon based on type */}
                        <span style={{ opacity: 0.7 }}>
                            {shape.type === 'rectangle' ? '⬜' : shape.type === 'ellipse' ? '⭕' : shape.type === 'artboard' ? '🎨' : shape.type === 'text' ? 'T' : '➖'}
                        </span>
                        <span style={{ textTransform: 'capitalize' }}>{shape.type}</span>
                    </div>
                    {/* ... (delete button etc) */}
                </div>
                {/* Render children if expanded */}
                {isExpanded && hasChildren && (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {/* To preserve visual stacking order (top to bottom), iterate in reverse of the data (which is usually adding-order) */}
                        {[...shape.children!].reverse().map(child => (
                            <LayerItem key={child.id} shape={child} depth={depth + 1} />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // Main render list (reversed for visual stacking logic)
    const reversedShapes = [...shapes].reverse();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h3 style={{ fontSize: "var(--text-sm)", color: "hsl(var(--color-text-muted))", padding: "var(--space-4)", paddingBottom: "var(--space-2)", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Layers</h3>

            <div style={{ flex: 1, overflowY: 'auto', padding: "0 var(--space-2)" }}>
                {reversedShapes.length === 0 && (
                    <div style={{ fontSize: "var(--text-sm)", color: "hsl(var(--color-text-secondary))", padding: "0 var(--space-2)" }}>
                        No layers
                    </div>
                )}
                {reversedShapes.map(shape => <LayerItem key={shape.id} shape={shape} depth={0} />)}
            </div>
        </div>
    );
}
