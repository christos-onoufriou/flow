import { create } from 'zustand';

export interface Shape {
    id: string;
    type: 'rectangle' | 'ellipse' | 'line' | 'text' | 'group' | 'artboard' | 'image' | 'video';
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    stroke?: string; // Lines use stroke instead of fill usually, or both
    strokeWidth?: number;
    x2?: number; // End point for line
    y2?: number;
    rotation?: number; // Degrees
    textContent?: string;
    src?: string; // For Image/Video
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    fontStyle?: 'normal' | 'italic';
    textAlign?: 'left' | 'center' | 'right';
    children?: Shape[];
    visible?: boolean;
    opacity?: number;
    cornerRadius?: number;
    aspectRatioLocked?: boolean;
    isTemplate?: boolean;
    templatePlatform?: string;
    templateBusiness?: string;
}

interface CanvasState {
    offset: { x: number; y: number };
    zoom: number;
    shapes: Shape[];
    activeTool: 'select' | 'rectangle' | 'ellipse' | 'line' | 'text' | 'artboard';
    selectedIds: string[];
    past: Shape[][];
    future: Shape[][];
    clipboard: Shape[];
    snapToGrid: boolean;
    gridSize: number;

    setOffset: (offset: { x: number; y: number } | ((prev: { x: number, y: number }) => { x: number, y: number })) => void;
    setZoom: (zoom: number | ((prev: number) => number)) => void;
    addShape: (shape: Shape) => void;
    updateShape: (id: string, updates: Partial<Shape>) => void;
    removeShape: (id: string) => void;
    setActiveTool: (tool: 'select' | 'rectangle' | 'ellipse' | 'line' | 'text' | 'artboard') => void;
    setSelectedIds: (ids: string[]) => void;
    reorderShape: (id: string, action: 'front' | 'back' | 'forward' | 'backward') => void;
    saveSnapshot: () => void;
    undo: () => void;
    redo: () => void;
    copy: () => void;
    paste: () => void;
    group: () => void;
    ungroup: () => void;
    toggleSnapToGrid: () => void;
    alignShapes: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
    distributeShapes: (distribution: 'horizontal' | 'vertical') => void;
    toggleVisibility: (id: string) => void;
    moveToArtboard: (shapeId: string, artboardId: string | null) => void;
    moveLayer: (dragId: string, targetId: string, position: 'before' | 'after' | 'inside') => void;
    templates: Template[];
    addTemplate: (template: Template) => void;
}

export interface Template {
    id: string;
    name: string;
    thumbnail: string;
    shapes: Shape[];
    platform: string;
    business: string;
    width: number;
    height: number;
}

// Recursively reorder a shape by ID
const recursiveReorder = (shapes: Shape[], id: string, action: 'front' | 'back' | 'forward' | 'backward'): { shapes: Shape[], success: boolean } => {
    const index = shapes.findIndex(s => s.id === id);
    if (index !== -1) {
        const newShapes = [...shapes];
        const [shape] = newShapes.splice(index, 1);
        switch (action) {
            case 'front': newShapes.push(shape); break;
            case 'back': newShapes.unshift(shape); break;
            case 'forward': newShapes.splice(Math.min(newShapes.length, index + 1), 0, shape); break;
            case 'backward': newShapes.splice(Math.max(0, index - 1), 0, shape); break;
        }
        return { shapes: newShapes, success: true };
    }

    let changed = false;
    const nextShapes = shapes.map(shape => {
        if (shape.children) {
            const result = recursiveReorder(shape.children, id, action);
            if (result.success) {
                changed = true;
                return { ...shape, children: result.shapes };
            }
        }
        return shape;
    });

    return { shapes: nextShapes, success: changed };
};

// Helper to remove a shape and return it
const findAndRemove = (shapes: Shape[], id: string): { shapes: Shape[], shape: Shape | null } => {
    const index = shapes.findIndex(s => s.id === id);
    if (index !== -1) {
        const newShapes = [...shapes];
        const [shape] = newShapes.splice(index, 1);
        return { shapes: newShapes, shape };
    }

    let foundShape: Shape | null = null;
    const nextShapes = shapes.map(s => {
        if (s.children) {
            const res = findAndRemove(s.children, id);
            if (res.shape) {
                foundShape = res.shape;
                return { ...s, children: res.shapes };
            }
        }
        return s;
    });

    return { shapes: nextShapes, shape: foundShape };
};

// Helper to insert a shape relative to a target
const insertRelative = (shapes: Shape[], targetId: string, shapeToInsert: Shape, position: 'before' | 'after' | 'inside'): { shapes: Shape[], success: boolean } => {
    // If inside, we look for the target and insert into its children
    if (position === 'inside') {
        return {
            shapes: shapes.map(s => {
                if (s.id === targetId) {
                    // Start relative coordinates conversion if entering a container?
                    // For now assume coordinates are handled or we need to handle them.
                    // If moving layers in panel, we might keep absolute positions or let logic handle it.
                    // Canvas logic handles reparenting with coordinate transform.
                    // This function just moves the data structure.
                    // Ideally we should update x/y if moving between spaces.
                    // But for now, let's just move the node.
                    return { ...s, children: [...(s.children || []), shapeToInsert] };
                }
                if (s.children) {
                    const res = insertRelative(s.children, targetId, shapeToInsert, position);
                    if (res.success) return { ...s, children: res.shapes };
                }
                return s;
            }),
            success: shapes.some(s => s.id === targetId) || shapes.some(s => s.children && insertRelative(s.children, targetId, shapeToInsert, position).success) // Crude success check
        };
    }

    const index = shapes.findIndex(s => s.id === targetId);
    if (index !== -1) {
        const newShapes = [...shapes];
        if (position === 'before') {
            newShapes.splice(index, 0, shapeToInsert);
        } else {
            newShapes.splice(index + 1, 0, shapeToInsert);
        }
        return { shapes: newShapes, success: true };
    }

    let inserted = false;
    const nextShapes = shapes.map(s => {
        if (s.children) {
            const res = insertRelative(s.children, targetId, shapeToInsert, position);
            if (res.success) {
                inserted = true;
                return { ...s, children: res.shapes };
            }
        }
        return s;
    });

    return { shapes: nextShapes, success: inserted };
};

// Recursively update a shape by ID
const recursiveUpdate = (shapes: Shape[], id: string, updates: Partial<Shape>): Shape[] => {
    return shapes.map(shape => {
        if (shape.id === id) {
            return { ...shape, ...updates };
        }
        if (shape.children) {
            return { ...shape, children: recursiveUpdate(shape.children, id, updates) };
        }
        return shape;
    });
};

// Recursively remove a shape by ID
const recursiveRemove = (shapes: Shape[], id: string): Shape[] => {
    return shapes.filter(s => s.id !== id).map(shape => {
        if (shape.children) {
            return { ...shape, children: recursiveRemove(shape.children, id) };
        }
        return shape;
    });
};

// Recursively toggle visibility
const recursiveToggleVisibility = (shapes: Shape[], id: string): Shape[] => {
    return shapes.map(shape => {
        if (shape.id === id) {
            return { ...shape, visible: !(shape.visible ?? true) };
        }
        if (shape.children) {
            return { ...shape, children: recursiveToggleVisibility(shape.children, id) };
        }
        return shape;
    });
};

export const useCanvasStore = create<CanvasState>((set) => ({
    offset: { x: 0, y: 0 },
    zoom: 1,
    shapes: [],
    activeTool: 'select',
    selectedIds: [],
    past: [],
    future: [],
    clipboard: [],
    snapToGrid: true,
    gridSize: 20,
    templates: [],
    addTemplate: (template) => set((state) => ({ templates: [...state.templates, template] })),

    setOffset: (updater) => set((state) => {
        const newOffset = typeof updater === 'function' ? updater(state.offset) : updater;
        return { offset: newOffset };
    }),
    setZoom: (updater) => set((state) => {
        const newZoom = typeof updater === 'function' ? updater(state.zoom) : updater;
        return { zoom: Math.max(0.1, Math.min(10, newZoom)) }; // Clamp 10% to 1000%
    }),
    addShape: (shape) => set((state) => ({ shapes: [...state.shapes, shape] })),
    updateShape: (id, updates) => set((state) => ({
        shapes: recursiveUpdate(state.shapes, id, updates),
    })),
    removeShape: (id) =>
        set((state) => ({
            shapes: recursiveRemove(state.shapes, id),
            selectedIds: state.selectedIds.filter((sid) => sid !== id)
        })),
    setActiveTool: (tool) => set({ activeTool: tool }),
    setSelectedIds: (ids: string[]) => set({ selectedIds: ids }),
    reorderShape: (id, action) => set((state) => {
        const result = recursiveReorder(state.shapes, id, action);
        if (!result.success) return {};
        return { shapes: result.shapes };
    }),
    moveLayer: (dragId, targetId, position) => set((state) => {
        if (dragId === targetId) return {};

        // 1. Find and remove dragId
        const removeRes = findAndRemove(state.shapes, dragId);
        if (!removeRes.shape) return {};

        // 2. Insert absolute or relative?
        // If we move between containers, we SHOULD update coordinates.
        // For 'inside', we definitely need to checks.
        // For 'before'/'after', we accept the target's parent coordinate space.
        // In a proper implementation we would transform coordinates.
        // For MVP manual reorder, let's assume user is reordering primarily.

        let shapeToInsert = removeRes.shape;

        // 3. Insert relative to target
        const insertRes = insertRelative(removeRes.shapes, targetId, shapeToInsert, position);

        if (!insertRes.success) {
            // Failed to find target, revert? Or just return shapes without the item (bad)
            // Ideally we shouldn't fail if UI is consistent.
            return {};
        }

        return { shapes: insertRes.shapes };
    }),
    saveSnapshot: () => set((state) => ({
        past: [...state.past, state.shapes],
        future: []
    })),
    undo: () => set((state) => {
        if (state.past.length === 0) return {};
        const previous = state.past[state.past.length - 1];
        const newPast = state.past.slice(0, -1);
        return {
            shapes: previous,
            past: newPast,
            future: [state.shapes, ...state.future]
        };
    }),
    redo: () => set((state) => {
        if (state.future.length === 0) return {};
        const next = state.future[0];
        const newFuture = state.future.slice(1);
        return {
            shapes: next,
            past: [...state.past, state.shapes],
            future: newFuture
        };
    }),
    copy: () => set((state) => {
        const selectedShapes = state.shapes.filter(s => state.selectedIds.includes(s.id));
        if (selectedShapes.length === 0) return {};
        // Deep clone to avoid reference issues
        return { clipboard: JSON.parse(JSON.stringify(selectedShapes)) };
    }),
    paste: () => set((state) => {
        if (state.clipboard.length === 0) return {};

        // Save snapshot before paste
        const newPast = [...state.past, state.shapes];

        const newShapes = state.clipboard.map(s => {
            const newId = crypto.randomUUID();
            return {
                ...s,
                id: newId,
                x: s.x + 20,
                y: s.y + 20,
                x2: s.x2 !== undefined ? s.x2 + 20 : undefined,
                y2: s.y2 !== undefined ? s.y2 + 20 : undefined
            };
        });

        return {
            shapes: [...state.shapes, ...newShapes],
            selectedIds: newShapes.map(s => s.id),
            past: newPast,
            future: []
        };
    }),
    group: () => set((state) => {
        const selectedShapes = state.shapes.filter(s => state.selectedIds.includes(s.id));
        if (selectedShapes.length < 2) return {}; // Need at least 2 to group (or 1? allow 1 for convenience wrapping)

        // Calculate Bounding Box
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        selectedShapes.forEach(s => {
            const sx = s.x;
            const sy = s.y;
            const sw = s.width;
            const sh = s.height;
            // Simplified AABB for now (ignores rotation of children for bbox calculation)
            // Ideally we should calculate AABB of rotated shapes.
            minX = Math.min(minX, sx);
            minY = Math.min(minY, sy);
            maxX = Math.max(maxX, sx + sw);
            maxY = Math.max(maxY, sy + sh);
            if (s.type === 'line') {
                const x2 = s.x2 ?? s.x;
                const y2 = s.y2 ?? s.y;
                minX = Math.min(minX, x2);
                minY = Math.min(minY, y2);
                maxX = Math.max(maxX, x2);
                maxY = Math.max(maxY, y2);
            }
        });

        // Add padding
        minX -= 10; minY -= 10; maxX += 10; maxY += 10;

        const groupX = minX;
        const groupY = minY;
        const groupW = maxX - minX;
        const groupH = maxY - minY;

        // Create Group Shape
        const newGroup: Shape = {
            id: crypto.randomUUID(),
            type: 'group',
            x: groupX,
            y: groupY,
            width: groupW,
            height: groupH,
            fill: 'transparent',
            children: selectedShapes.map(s => ({
                ...s,
                // Convert to relative coordinates
                x: s.x - groupX,
                y: s.y - groupY,
                x2: s.x2 !== undefined ? s.x2 - groupX : undefined,
                y2: s.y2 !== undefined ? s.y2 - groupY : undefined
            }))
        };

        const newPast = [...state.past, state.shapes];

        // Remove selected shapes from top level, add group
        const remainingShapes = state.shapes.filter(s => !state.selectedIds.includes(s.id));

        return {
            shapes: [...remainingShapes, newGroup],
            selectedIds: [newGroup.id],
            past: newPast,
            future: []
        };
    }),
    ungroup: () => set((state) => {
        const selectedGroups = state.shapes.filter(s => state.selectedIds.includes(s.id) && s.type === 'group');
        if (selectedGroups.length === 0) return {};

        const newPast = [...state.past, state.shapes];

        let newShapes = [...state.shapes];
        let newSelectedIds: string[] = [];

        selectedGroups.forEach(group => {
            if (!group.children) return;

            // Remove group
            newShapes = newShapes.filter(s => s.id !== group.id);

            // Add children back with absolute coordinates
            const restoredChildren = group.children.map(child => {
                // Apply group transforms if any (not implemented yet for rotation/scale of group)
                // Assuming group is just translated for now.
                // If group was rotated, we'd need to apply that matrix to children.
                // Current MVP: Group translation only.

                // Note: If group was moved, group.x/y changed. 
                // Child absolute = Group.x + Child.relativeX.
                return {
                    ...child,
                    x: group.x + child.x,
                    y: group.y + child.y,
                    x2: child.x2 !== undefined ? group.x + (child.x2 ?? 0) : undefined,
                    y2: child.y2 !== undefined ? group.y + (child.y2 ?? 0) : undefined
                };
            });

            newShapes.push(...restoredChildren);
            newSelectedIds.push(...restoredChildren.map(c => c.id));
        });

        return {
            shapes: newShapes,
            selectedIds: newSelectedIds,
            past: newPast,
            future: []
        };
    }),
    toggleSnapToGrid: () => set((state) => ({ snapToGrid: !state.snapToGrid })),
    alignShapes: (alignment) => set((state) => {
        const selectedShapes = state.shapes.filter(s => state.selectedIds.includes(s.id));
        if (selectedShapes.length < 2) return {};

        // Calculate Bounding Box of Selection
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        selectedShapes.forEach(s => {
            const sx = s.x;
            const sy = s.y;
            let sw = s.width;
            let sh = s.height;
            if (s.type === 'line') {
                const x2 = s.x2 ?? s.x;
                const y2 = s.y2 ?? s.y;
                minX = Math.min(minX, sx, x2);
                minY = Math.min(minY, sy, y2);
                maxX = Math.max(maxX, sx, x2);
                maxY = Math.max(maxY, sy, y2);
            } else {
                minX = Math.min(minX, sx);
                minY = Math.min(minY, sy);
                maxX = Math.max(maxX, sx + sw);
                maxY = Math.max(maxY, sy + sh);
            }
        });

        const bboxCenterX = minX + (maxX - minX) / 2;
        const bboxCenterY = minY + (maxY - minY) / 2;

        const newPast = [...state.past, state.shapes];

        const newShapes = state.shapes.map(s => {
            if (!state.selectedIds.includes(s.id)) return s;

            let nx = s.x;
            let ny = s.y;
            let nx2 = s.x2;
            let ny2 = s.y2;

            // Width/Height for alignment calculations
            let sw = s.width;
            let sh = s.height;
            if (s.type === 'line') {
                const x1 = s.x;
                const x2 = s.x2 ?? s.x;
                const y1 = s.y;
                const y2 = s.y2 ?? s.y;
                sw = Math.abs(x2 - x1); // Visual width (bbox)
                sh = Math.abs(y2 - y1);

                // Alignment logic acts on the BBOX of the line.
                // We need to calculate dx/dy.

                let targetX = 0;
                let targetY = 0;

                // Current BBox Left/Top
                const curLeft = Math.min(x1, x2);
                const curTop = Math.min(y1, y2);

                // Determine target Left/Top
                if (alignment === 'left') targetX = minX;
                else if (alignment === 'center') targetX = bboxCenterX - sw / 2;
                else if (alignment === 'right') targetX = maxX - sw;

                if (alignment === 'top') targetY = minY;
                else if (alignment === 'middle') targetY = bboxCenterY - sh / 2;
                else if (alignment === 'bottom') targetY = maxY - sh;

                // Apply delta
                if (['left', 'center', 'right'].includes(alignment)) {
                    const dx = targetX - curLeft;
                    nx += dx;
                    nx2 = (nx2 ?? 0) + dx;
                }
                if (['top', 'middle', 'bottom'].includes(alignment)) {
                    const dy = targetY - curTop;
                    ny += dy;
                    ny2 = (ny2 ?? 0) + dy;
                }

            } else {
                const cx = s.x + s.width / 2;
                const cy = s.y + s.height / 2;

                switch (alignment) {
                    case 'left': nx = minX; break;
                    case 'center': nx = bboxCenterX - s.width / 2; break;
                    case 'right': nx = maxX - s.width; break;
                    case 'top': ny = minY; break;
                    case 'middle': ny = bboxCenterY - s.height / 2; break;
                    case 'bottom': ny = maxY - s.height; break;
                }
            }

            return { ...s, x: nx, y: ny, x2: nx2, y2: ny2 };
        });

        return { shapes: newShapes, past: newPast, future: [] };
    }),
    distributeShapes: (distribution) => set((state) => {
        const selectedShapes = state.shapes.filter(s => state.selectedIds.includes(s.id));
        if (selectedShapes.length < 3) return {};

        // Sort shapes by center
        const getCenter = (s: Shape) => {
            if (s.type === 'line') {
                const min_x = Math.min(s.x, s.x2 ?? s.x);
                const max_x = Math.max(s.x, s.x2 ?? s.x);
                const min_y = Math.min(s.y, s.y2 ?? s.y);
                const max_y = Math.max(s.y, s.y2 ?? s.y);
                return { x: min_x + (max_x - min_x) / 2, y: min_y + (max_y - min_y) / 2 };
            }
            return { x: s.x + s.width / 2, y: s.y + s.height / 2 };
        };

        const sorted = [...selectedShapes].sort((a, b) => {
            const ca = getCenter(a);
            const cb = getCenter(b);
            return distribution === 'horizontal' ? ca.x - cb.x : ca.y - cb.y;
        });

        const first = getCenter(sorted[0]);
        const last = getCenter(sorted[sorted.length - 1]);

        const range = distribution === 'horizontal' ? last.x - first.x : last.y - first.y;
        const interval = range / (sorted.length - 1);

        const newPast = [...state.past, state.shapes];
        const newShapes = state.shapes.map(s => {
            if (!state.selectedIds.includes(s.id)) return s;

            const idx = sorted.findIndex(so => so.id === s.id);
            if (idx === -1) return s;

            const targetCenter = (distribution === 'horizontal')
                ? first.x + idx * interval
                : first.y + idx * interval;

            const current = getCenter(s);
            const delta = (distribution === 'horizontal')
                ? targetCenter - current.x
                : targetCenter - current.y;

            let nx = s.x;
            let ny = s.y;
            let nx2 = s.x2;
            let ny2 = s.y2;

            if (distribution === 'horizontal') {
                nx += delta;
                if (s.type === 'line') nx2 = (nx2 ?? 0) + delta;
            } else {
                ny += delta;
                if (s.type === 'line') ny2 = (ny2 ?? 0) + delta;
            }

            return { ...s, x: nx, y: ny, x2: nx2, y2: ny2 };
        });

        return { shapes: newShapes, past: newPast, future: [] };
    }),

    toggleVisibility: (id) => set((state) => {
        const newPast = [...state.past, state.shapes];
        return {
            shapes: recursiveToggleVisibility(state.shapes, id),
            past: newPast,
            future: []
        };
    }),
    moveToArtboard: (shapeId, artboardId) => set((state) => {
        const shape = state.shapes.find(s => s.id === shapeId);
        if (!shape) return {}; // Shape not found in root (handling nested requires more logic, skipping for MVP)

        const newPast = [...state.past, state.shapes];
        let newShapes = state.shapes.filter(s => s.id !== shapeId);

        if (artboardId) {
            // Move TO artboard
            const artboardIndex = newShapes.findIndex(s => s.id === artboardId);
            if (artboardIndex === -1) return {}; // Artboard not found

            const artboard = newShapes[artboardIndex];
            if (artboard.type !== 'artboard') return {}; // Target is not an artboard

            // Convert to local coordinates
            const relativeShape = {
                ...shape,
                x: shape.x - artboard.x,
                y: shape.y - artboard.y
            };

            const updatedArtboard = {
                ...artboard,
                children: [...(artboard.children || []), relativeShape]
            };

            newShapes[artboardIndex] = updatedArtboard;
        } else {
            // Move TO root (FROM artboard) - logic handles dragging FROM root to root, which is no-op.
            // But if we are calling this, we imply a change.
            // Wait, this specific implementation only handles Root -> Artboard.
            // Handling Artboard -> Root requires finding the shape INSIDE an artboard first.
            // Let's implement Root -> Artboard first.
            return {};
        }

        return {
            shapes: newShapes,
            past: newPast,
            future: []
        };
    }),
}));
