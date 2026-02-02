'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useCanvasStore } from "@/store/canvasStore";
import { Shape } from "@/store/canvasStore";
import { findShape } from "@/utils/shapeUtils";
export function Canvas() {
    const containerRef = useRef<HTMLDivElement>(null);

    const { offset, zoom, shapes, activeTool, setActiveTool, setOffset, setZoom, addShape, selectedIds, setSelectedIds, updateShape, removeShape, saveSnapshot, undo, redo, copy, paste, group, ungroup, snapToGrid, gridSize, toggleSnapToGrid, moveToArtboard } = useCanvasStore();

    const [drawingShape, setDrawingShape] = useState<Shape | null>(null);

    // Interaction State
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState<string | null>(null); // 'nw', 'ne', 'sw', 'se'
    const [isRotating, setIsRotating] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 }); // World coords
    const [initialShapePositions, setInitialShapePositions] = useState<{ [id: string]: Shape }>({});

    // Marquee Selection State
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 }); // World coords
    const [selectionEnd, setSelectionEnd] = useState({ x: 0, y: 0 }); // World coords

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedIds.length > 0) {
                    saveSnapshot();
                    selectedIds.forEach(id => removeShape(id));
                    setSelectedIds([]);
                }
            } else if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
                e.preventDefault();
                if (e.shiftKey) {
                    redo();
                } else {
                    undo();
                }
            } else if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
                e.preventDefault();
                redo();
            } else if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
                e.preventDefault();
                copy();
            } else if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
                e.preventDefault();
                paste();
            } else if ((e.metaKey || e.ctrlKey) && e.key === 'x') {
                e.preventDefault();
                copy();
                if (selectedIds.length > 0) {
                    saveSnapshot();
                    selectedIds.forEach(id => removeShape(id));
                    setSelectedIds([]);
                }
            } else if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
                e.preventDefault();
                copy();
                paste();
            } else if ((e.metaKey || e.ctrlKey) && e.key === 'g') {
                e.preventDefault();
                if (e.shiftKey) {
                    ungroup();
                } else {
                    group();
                }
            } else if ((e.metaKey || e.ctrlKey) && e.key === "'") {
                e.preventDefault();
                toggleSnapToGrid();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIds, removeShape, setSelectedIds]);

    // Wheel handling for Pan and Zoom
    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const zoomFactor = -e.deltaY * 0.002;
            setZoom((prev) => prev * (1 + zoomFactor));
        } else {
            const panX = -e.deltaX;
            const panY = -e.deltaY;
            setOffset((prev) => ({ x: prev.x + panX, y: prev.y + panY }));
        }
    };

    const getMousePosition = (e: React.MouseEvent) => {
        if (!containerRef.current) return { x: 0, y: 0 };
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - offset.x) / zoom;
        const y = (e.clientY - rect.top - offset.y) / zoom;
        return { x, y };
    };

    const snapValue = (value: number) => {
        if (!snapToGrid) return value;
        return Math.round(value / gridSize) * gridSize;
    };

    const handleShapeMouseDown = (e: React.MouseEvent, id: string) => {
        if (activeTool !== 'select') return;
        e.stopPropagation();

        const isSelected = selectedIds.includes(id);
        let newSelectedIds = selectedIds;

        if (e.shiftKey) {
            if (isSelected) {
                newSelectedIds = selectedIds.filter(sid => sid !== id);
            } else {
                newSelectedIds = [...selectedIds, id];
            }
        } else {
            if (!isSelected) {
                newSelectedIds = [id];
            }
        }
        setSelectedIds(newSelectedIds);

        // Prepare Drag
        const { x, y } = getMousePosition(e);
        setDragStart({ x, y });
        const initialPos: { [id: string]: Shape } = {};

        newSelectedIds.forEach(id => {
            const s = findShape(shapes, id);
            if (s) {
                initialPos[id] = { ...s };
            }
        });
        setInitialShapePositions(initialPos);
        saveSnapshot(); // Save before move
        setIsDragging(true);
    };

    const handleHandleMouseDown = (e: React.MouseEvent, id: string, handle: string) => {
        if (activeTool !== 'select') return;
        e.stopPropagation();

        const { x, y } = getMousePosition(e);
        setDragStart({ x, y });
        const s = findShape(shapes, id);
        if (s) {
            setInitialShapePositions({ [id]: { ...s } });
        }

        if (handle === 'rotate') {
            saveSnapshot(); // Save before rotate
            setIsRotating(true);
        } else {
            saveSnapshot(); // Save before resize
            setIsResizing(handle);
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        const { x, y } = getMousePosition(e);

        if (activeTool === 'select') {
            // Marquee selection start
            setIsSelecting(true);
            setSelectionStart({ x, y });
            setSelectionEnd({ x, y });

            if (!e.shiftKey) {
                setSelectedIds([]);
            }
            return;
        }

        if (activeTool === 'text') {
            const newShape: Shape = {
                id: crypto.randomUUID(),
                type: 'text',
                x,
                y,
                width: 100, // Default width for selection box
                height: 30, // Default height
                fill: 'black',
                textContent: 'Text',
                fontSize: 16,
                fontFamily: 'sans-serif',
                rotation: 0
            };
            saveSnapshot(); // Save before create
            addShape(newShape);
            setActiveTool('select');
            setSelectedIds([newShape.id]);
            return;
        }

        const newShape: Shape = {
            id: crypto.randomUUID(),
            type: activeTool,
            x: snapValue(x),
            y: snapValue(y),
            width: 0,
            height: 0,
            fill: activeTool === 'line' ? 'transparent' : (activeTool === 'rectangle' ? '#e0e0e0' : '#d0d0ff'),
            stroke: activeTool === 'line' ? '#000000' : undefined,
            strokeWidth: activeTool === 'line' ? 2 : undefined,
            x2: snapValue(x),
            y2: snapValue(y),
            rotation: 0
        };
        saveSnapshot(); // Save before create intent
        setDrawingShape(newShape);
    };

    const rotatePoint = (px: number, py: number, cx: number, cy: number, angleDeg: number) => {
        const rad = (angleDeg * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const nx = (cos * (px - cx)) - (sin * (py - cy)) + cx;
        const ny = (sin * (px - cx)) + (cos * (py - cy)) + cy;
        return { x: nx, y: ny };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const { x, y } = getMousePosition(e);

        if (activeTool === 'select') {
            if (isSelecting) {
                setSelectionEnd({ x, y });
                return;
            }

            if (isRotating) {
                const id = Object.keys(initialShapePositions)[0];
                const initial = initialShapePositions[id];
                if (!initial) return;

                const cx = initial.x + initial.width / 2;
                const cy = initial.y + initial.height / 2;

                // Calculate angle from center to mouse
                const dx = x - cx;
                const dy = y - cy;
                let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90; // +90 because handle is at top

                if (e.shiftKey) {
                    angle = Math.round(angle / 15) * 15;
                }

                updateShape(id, { rotation: angle });
                return;
            }

            if (isResizing) {
                const id = Object.keys(initialShapePositions)[0];
                const initial = initialShapePositions[id];
                if (!initial) return;

                // Simple AABB resize for now if not rotated much, 
                // BUT for proper OBB resize it's complex.
                // Let's implement unrotated logic first which works for rotation=0. 
                // For rotated shapes, we need to rotate mouse back.

                const rotation = initial.rotation || 0;
                const cx = initial.x + initial.width / 2;
                const cy = initial.y + initial.height / 2;

                // Rotate mouse point around center by -rotation
                const unrotatedMouse = rotatePoint(x, y, cx, cy, -rotation);
                const unrotatedStart = rotatePoint(dragStart.x, dragStart.y, cx, cy, -rotation);

                const dx = unrotatedMouse.x - unrotatedStart.x;
                const dy = unrotatedMouse.y - unrotatedStart.y;

                let newX = initial.x;
                let newY = initial.y;
                let newW = initial.width;
                let newH = initial.height;

                if (isResizing.includes('w')) {
                    newW = initial.width - dx;
                    newX = initial.x + dx;
                }
                if (isResizing.includes('e')) {
                    newW = initial.width + dx;
                }
                if (isResizing.includes('n')) {
                    newH = initial.height - dy;
                    newY = initial.y + dy;
                }
                if (isResizing.includes('s')) {
                    newH = initial.height + dy;
                }

                if (initial.type === 'line') {
                    // Lines are simpler, handled by points. 
                    // This logic above is for Rect/Ellipse/Text.
                    if (isResizing === 'start') {
                        const dxGlobal = x - dragStart.x;
                        const dyGlobal = y - dragStart.y;
                        updateShape(id, { x: initial.x + dxGlobal, y: initial.y + dyGlobal });
                    } else if (isResizing === 'end') {
                        const dxGlobal = x - dragStart.x;
                        const dyGlobal = y - dragStart.y;
                        updateShape(id, { x2: (initial.x2 ?? initial.x) + dxGlobal, y2: (initial.y2 ?? initial.y) + dyGlobal });
                    }
                    return;
                }

                if (newW < 2) newW = 2;
                if (newH < 2) newH = 2;

                // Now we have the new unrotated box (newX, newY, newW, newH).
                // But wait, if we changed X/Y/W/H in unrotated space, the center might have moved.
                // If we are resizing from a corner, the opposite corner should stay fixed IN WORLD SPACE.

                // Simplified approach: Just update width/height and re-center? 
                // No, that makes it scale from center.
                // Standard approach:
                // 1. Calculate new center in unrotated space: 
                const newCx = newX + newW / 2;
                const newCy = newY + newH / 2;

                // 2. Rotate this new center back to world space
                const rotatedCenter = rotatePoint(newCx, newCy, cx, cy, rotation);

                // Actually, the newX/newY from above arithmetic assumes we are in the unrotated frame
                // relative to the OLD center.
                // The shift (dx, dy) was calculated in that frame.
                // So newX, newY are correct in that frame.
                // But the shape property matches that frame (it defines the box before rotation).
                // However, the pivot point for rotation (center) has moved relative to the shape origin if we resize asymmetrically.

                // Correct update:
                // Width/Height are just the newW/newH.
                // The new Center position (in world) needs to be calculated so that the box appears 
                // to have resized towards the mouse.
                // BUT our data model defines position as Top-Left of unrotated box.
                // And Rotation is around Center.

                // So: 
                // oldCenter = (initial.x + initial.width/2, initial.y + initial.height/2)
                // newCenterUnrotated = (newX + newW/2, newY + newH/2)

                // The problem is "rotation around center". If we change width, center changes.
                // If we just update width/height/x/y, the new center will be (x+w/2, y+h/2).
                // And the shape will obtain the rotation value.
                // So the shape will be drawn rotated around the NEW center.

                // We need to ensure that the unrotated change corresponds to what we want visually.
                // If we dragged right handle, we want Left side to assume fixed.
                // In unrotated space, Left side is x. Right side moves.
                // Center moves from x+w/2 to x+newW/2.
                // So in unrotated space it behaves correctly.
                // Since we apply the rotation around the center AT RENDER TIME, 
                // updating x,y,w,h is sufficient IF the rotation point was intrinsic.
                // Yes, SVG rotate(angle, x+w/2, y+h/2) does exactly this.

                // WAIT. If I rotate 45 deg, and drag Right handle.
                // The box expands to the "right" (local).
                // The center moves to the "right" (local).
                // The visual rendering rotates around the NEW center.
                // Does the Left side stay fixed in world space?
                // Let's trace.
                // Left side unrotated: (x, y+h/2).
                // Rotated: rotate((x, y+h/2), (x+w/2, y+h/2), angle).
                // New Left side unrotated: (x, y+h/2). Use same X because we only changed W.
                // But center moved. New Center: (x+newW/2, y+h/2).
                // New Rotated: rotate((x, y+h/2), (x+newW/2, y+h/2), angle).
                // Since the point (x, y+h/2) is NOT the center of rotation, its world position DEPENDS on the center.
                // So if center moves, the world position of Left side moves.
                // So standard x/y/w/h update is NOT sufficient to keep opposite side fixed in world space.

                // We need to adjust x,y such that the fixed anchor point stays fixed.
                // Fixed Anchor Unrotated: (initial.x, initial.y+h/2) (for E drag).
                // Fixed Anchor World: rotate(FixedAnchorUnrotated, oldCenter, angle).

                // New Box Unrotated (tentative): x=initial.x, y=initial.y, w=newW, h=newH.
                // New Center Unrotated: ...
                // New Fixed Anchor World: rotate(FixedAnchorUnrotated, newCenter, angle).
                // We want New Fixed Anchor World == Old Fixed Anchor World.

                // We need to shift the whole box (dx_correction, dy_correction) so they match.

                // Let's calculate the shift.

                const oldCenterConfig = { x: cx, y: cy };
                const newCenterConfig = { x: newX + newW / 2, y: newY + newH / 2 };

                // Calculate where the "fixed point" (e.g. top-left corner) ends up
                // We need to pick a fixed point based on handle.
                // For 'e' handle, fixed point is 'w' (left-center? no, left side). Let's use TopLeft for simplicity math, 
                // but actually for 'e' resize, TopLeft is fixed in X, but Y? 
                // No, for 'e' resize, Left-Top and Left-Bottom are fixed.
                // So Top-Left (x, y) is fixed in unrotated space.

                // Let's take the Top-Left corner (initial.x, initial.y).
                const tl_unrotated = { x: initial.x, y: initial.y };
                const tl_world_old = rotatePoint(tl_unrotated.x, tl_unrotated.y, oldCenterConfig.x, oldCenterConfig.y, rotation);

                // With the new dimensions (newX, newY, newW, newH)
                // The Top-Left is at (newX, newY).
                const tl_world_new_tentative = rotatePoint(newX, newY, newCenterConfig.x, newCenterConfig.y, rotation);

                // The discrepancy
                const diffX = tl_world_new_tentative.x - tl_world_old.x;
                const diffY = tl_world_new_tentative.y - tl_world_old.y;

                // We need to subtract this difference from the shape's position to keep TL fixed?
                // Wait. 
                // If handle is 'se', TL is fixed.
                // If handle is 'e', TL should be fixed? No, Left-Center should be fixed?
                // Actually for standard resize, we want the "Opposite Side" to remain fixed.
                // If I drag E, W side is fixed.
                // If I drag SE, NW corner is fixed.

                // Let's apply this correction only for corner resizes for now to test.
                // Actually, if I just update x,y,w,h naively, it does "center-based resizing" effectively? 
                // No, it extends to the right (unrotated), so the center moves right.
                // So the rotation pivot moves right.
                // So the whole shape swings.

                // Let's stick to the Unrotated logic for now and see if it feels okay-ish? 
                // It usually feels weird ("swinging").
                // But implementing the full correction is complex for this step.
                // Let's try to do it right.

                // We need to find the "Anchor Point" in local unrotated space.
                let anchorX = 0; // 0 = left, 0.5 = center, 1 = right
                let anchorY = 0; // 0 = top, 0.5 = center, 1 = bottom

                if (isResizing.includes('w')) anchorX = 1; else if (isResizing.includes('e')) anchorX = 0; else anchorX = 0.5;
                if (isResizing.includes('n')) anchorY = 1; else if (isResizing.includes('s')) anchorY = 0; else anchorY = 0.5;

                // The anchor point in world space coordinates
                const anchorLocalX = initial.x + initial.width * anchorX;
                const anchorLocalY = initial.y + initial.height * anchorY;
                const anchorWorld = rotatePoint(anchorLocalX, anchorLocalY, cx, cy, rotation);

                // Calculate new dimensions (already done above: newX, newY, newW, newH)
                // New center tentative
                const newCxTentative = newX + newW / 2;
                const newCyTentative = newY + newH / 2;

                // Where is the anchor point in the new tentative shape?
                // The anchor is at the same relative position (anchorX, anchorY) of the new box.
                const newAnchorLocalX = newX + newW * anchorX;
                const newAnchorLocalY = newY + newH * anchorY;
                const newAnchorWorldTentative = rotatePoint(newAnchorLocalX, newAnchorLocalY, newCxTentative, newCyTentative, rotation);

                // Calculate shift needed to bring the anchor back to its original world position
                const shiftX = anchorWorld.x - newAnchorWorldTentative.x;
                const shiftY = anchorWorld.y - newAnchorWorldTentative.y;

                // Apply shift
                updateShape(id, { x: newX + shiftX, y: newY + shiftY, width: newW, height: newH });
                return;
            }

            if (isDragging) {
                const dx = x - dragStart.x;
                const dy = y - dragStart.y;

                selectedIds.forEach(id => {
                    const initial = initialShapePositions[id];
                    if (initial) {
                        if (initial.type === 'line') {
                            // Calculate new absolute positions
                            let nx = initial.x + dx;
                            let ny = initial.y + dy;
                            let nx2 = (initial.x2 ?? initial.x) + dx;
                            let ny2 = (initial.y2 ?? initial.y) + dy;

                            // Apply snapping if needed (Snap Top-Left vs Start Point?)
                            // For lines, snapping drag usually means snapping start point?
                            if (snapToGrid) {
                                // Calculate displacement from snapped start
                                const snx = snapValue(nx);
                                const sny = snapValue(ny);
                                const diffX = snx - nx;
                                const diffY = sny - ny;
                                nx = snx;
                                ny = sny;
                                nx2 += diffX;
                                ny2 += diffY;
                            }

                            updateShape(id, {
                                x: nx,
                                y: ny,
                                x2: nx2,
                                y2: ny2
                            });
                        } else {
                            let nx = initial.x + dx;
                            let ny = initial.y + dy;

                            if (snapToGrid) {
                                nx = snapValue(nx);
                                ny = snapValue(ny);
                            }

                            updateShape(id, { x: nx, y: ny });
                        }
                    }
                });
                return;
            }
        }

        if (drawingShape) {
            if (activeTool === 'line') {
                setDrawingShape({
                    ...drawingShape,
                    x2: snapValue(x),
                    y2: snapValue(y)
                });
            } else {
                const width = snapValue(x) - drawingShape.x;
                const height = snapValue(y) - drawingShape.y;

                setDrawingShape({
                    ...drawingShape,
                    width,
                    height
                });
            }
        }
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        if (isSelecting) {
            const sx = Math.min(selectionStart.x, selectionEnd.x);
            const sy = Math.min(selectionStart.y, selectionEnd.y);
            const sw = Math.abs(selectionEnd.x - selectionStart.x);
            const sh = Math.abs(selectionEnd.y - selectionStart.y);

            const selected = shapes.filter(s => {
                let bx = s.x;
                let by = s.y;
                let bw = s.width;
                let bh = s.height;

                if (s.visible === false) return false;

                if (s.type === 'line') {
                    const x2 = s.x2 ?? s.x;
                    const y2 = s.y2 ?? s.y;
                    bx = Math.min(s.x, x2);
                    by = Math.min(s.y, y2);
                    bw = Math.abs(x2 - s.x);
                    bh = Math.abs(y2 - s.y);
                    if (bw < 1) bw = 1;
                    if (bh < 1) bh = 1;
                }

                // For rotated shapes, this AABB check is inaccurate but acceptable for MVP
                // Ideally we'd check OBB intersection.

                // Check intersection
                return !(bx > sx + sw || bx + bw < sx || by > sy + sh || by + bh < sy);
            }).map(s => s.id);

            setSelectedIds(e.shiftKey ? [...new Set([...selectedIds, ...selected])] : selected);
            setIsSelecting(false);
        }

        if (isDragging && selectedIds.length === 1) {
            const id = selectedIds[0];
            const shape = findShape(shapes, id);
            if (shape && shape.type !== 'artboard') {
                const artboard = shapes.find(s => s.type === 'artboard' &&
                    shape.x >= s.x && shape.y >= s.y &&
                    shape.x + shape.width <= s.x + s.width &&
                    shape.y + shape.height <= s.y + s.height
                );
                if (artboard) {
                    saveSnapshot();
                    moveToArtboard(id, artboard.id);
                    setSelectedIds([]);
                }
            }
        }

        setIsDragging(false);
        setIsResizing(null);
        setIsRotating(false);

        if (drawingShape) {
            const finalShape = { ...drawingShape };

            if (activeTool !== 'line') {
                if (finalShape.width < 0) {
                    finalShape.x += finalShape.width;
                    finalShape.width = Math.abs(finalShape.width);
                }
                if (finalShape.height < 0) {
                    finalShape.y += finalShape.height;
                    finalShape.height = Math.abs(finalShape.height);
                }

                if (finalShape.width > 2 && finalShape.height > 2) {
                    saveSnapshot();
                    addShape(finalShape);
                }
            } else {
                const dist = Math.sqrt(Math.pow((finalShape.x2 ?? 0) - finalShape.x, 2) + Math.pow((finalShape.y2 ?? 0) - finalShape.y, 2));
                if (dist > 2) {
                    saveSnapshot();
                    addShape(finalShape);
                }
            }

            setDrawingShape(null);
            setActiveTool('select');
            setSelectedIds([finalShape.id]);
        }
    };

    const renderShape = (shape: Shape, isChild: boolean = false, groupTransform: string = '') => {
        if (shape.visible === false) return null;

        const isSelected = selectedIds.includes(shape.id);
        const rotation = shape.rotation || 0;
        const cx = shape.x + shape.width / 2;
        const cy = shape.y + shape.height / 2;
        const transform = shape.type !== 'line' ? `rotate(${rotation}, ${cx}, ${cy})` : undefined;

        const opacity = shape.opacity ?? 1;

        return (
            <React.Fragment key={shape.id}>
                <g transform={transform} className="shape-group" style={{ opacity }}>
                    {shape.type === 'group' && (
                        <g transform={`translate(${shape.x}, ${shape.y})`}>
                            {/* Render Children */}
                            {shape.children?.map(child => renderShape(child, true))}

                            {/* Group Selection Box (if selected) */}
                            {/* Intentionally transparent container usually, but we might want a border if selected */}
                        </g>
                    )}

                    {shape.type === 'artboard' && (
                        <g>
                            <defs>
                                <clipPath id={`clip-${shape.id}`}>
                                    <rect x={0} y={0} width={shape.width} height={shape.height} />
                                </clipPath>
                            </defs>
                            {/* Artboard Label */}
                            <text
                                x={shape.x}
                                y={shape.y - 8}
                                fill="#888"
                                fontSize={10 / zoom}
                                style={{ pointerEvents: 'none' }}
                            >
                                Artboard
                            </text>
                            {/* Artboard Background */}
                            <rect
                                x={shape.x}
                                y={shape.y}
                                width={shape.width}
                                height={shape.height}
                                fill={shape.fill}
                                filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))"
                                stroke={isSelected ? "hsl(var(--color-accent))" : "transparent"}
                                strokeWidth={2 / zoom}
                                onMouseDown={(e) => !isChild && handleShapeMouseDown(e, shape.id)}
                            />
                            {/* Clipped Children */}
                            <g clipPath={`url(#clip-${shape.id})`} transform={`translate(${shape.x}, ${shape.y})`}>
                                {shape.children?.map(child => renderShape(child, false))}
                            </g>
                        </g>
                    )}

                    {shape.type === 'rectangle' && (
                        <rect
                            x={shape.x}
                            y={shape.y}
                            width={shape.width}
                            height={shape.height}
                            fill={shape.fill}
                            rx={shape.cornerRadius || 0}
                            ry={shape.cornerRadius || 0}
                            stroke={isSelected && !isChild ? "hsl(var(--color-accent))" : (shape.stroke || "transparent")}
                            strokeWidth={1 / zoom}
                            vectorEffect="non-scaling-stroke"
                            onMouseDown={(e) => !isChild && handleShapeMouseDown(e, shape.id)}
                            style={{ pointerEvents: isChild ? 'none' : 'auto' }} // Children don't capture mouse events separately yet if grouped
                        />
                    )}
                    {shape.type === 'ellipse' && (
                        <ellipse
                            cx={shape.x + shape.width / 2}
                            cy={shape.y + shape.height / 2}
                            rx={Math.abs(shape.width / 2)}
                            ry={Math.abs(shape.height / 2)}
                            fill={shape.fill}
                            stroke={isSelected && !isChild ? "hsl(var(--color-accent))" : (shape.stroke || "transparent")}
                            strokeWidth={1 / zoom}
                            vectorEffect="non-scaling-stroke"
                            onMouseDown={(e) => !isChild && handleShapeMouseDown(e, shape.id)}
                            style={{ pointerEvents: isChild ? 'none' : 'auto' }}
                        />
                    )}
                    {shape.type === 'line' && (
                        <line
                            x1={shape.x}
                            y1={shape.y}
                            x2={shape.x2 ?? shape.x}
                            y2={shape.y2 ?? shape.y}
                            stroke={shape.stroke || shape.fill || "black"}
                            strokeWidth={(shape.strokeWidth || 2) / zoom}
                            strokeLinecap="round"
                            onMouseDown={(e) => !isChild && handleShapeMouseDown(e, shape.id)}
                            style={{ cursor: 'pointer', pointerEvents: isChild ? 'none' : 'auto' }}
                        />
                    )}
                    {shape.type === 'text' && (
                        <text
                            x={shape.x}
                            y={shape.y}
                            fontSize={shape.fontSize || 16}
                            fontFamily={shape.fontFamily || 'sans-serif'}
                            fill={shape.fill || 'black'}
                            style={{ userSelect: 'none', cursor: 'default', pointerEvents: isChild ? 'none' : 'auto' }}
                            dominantBaseline="hanging"
                            onMouseDown={(e) => !isChild && handleShapeMouseDown(e, shape.id)}
                        >
                            {shape.textContent || 'Text'}
                        </text>
                    )}

                    {/* Selection Controls (Only for Top-Level Selected Items) */}
                    {isSelected && !drawingShape && !isChild && (
                        <>
                            {/* Bounding Box for Group or Single Item */}
                            <rect
                                x={shape.x}
                                y={shape.y}
                                width={shape.width}
                                height={shape.height}
                                fill="none"
                                stroke="hsl(var(--color-accent))"
                                strokeWidth={1 / zoom}
                                pointerEvents="none"
                                strokeDasharray={shape.type === 'group' ? "4 2" : undefined}
                            />

                            {/* Handles (Common for all types including Group) */}
                            {/* TL */}
                            <rect x={shape.x - 4 / zoom} y={shape.y - 4 / zoom} width={8 / zoom} height={8 / zoom}
                                fill="white" stroke="hsl(var(--color-accent))" strokeWidth={1 / zoom}
                                onMouseDown={(e) => handleHandleMouseDown(e, shape.id, 'nw')} style={{ cursor: 'nwse-resize' }} />
                            {/* TR */}
                            <rect x={shape.x + shape.width - 4 / zoom} y={shape.y - 4 / zoom} width={8 / zoom} height={8 / zoom}
                                fill="white" stroke="hsl(var(--color-accent))" strokeWidth={1 / zoom}
                                onMouseDown={(e) => handleHandleMouseDown(e, shape.id, 'ne')} style={{ cursor: 'nesw-resize' }} />
                            {/* BL */}
                            <rect x={shape.x - 4 / zoom} y={shape.y + shape.height - 4 / zoom} width={8 / zoom} height={8 / zoom}
                                fill="white" stroke="hsl(var(--color-accent))" strokeWidth={1 / zoom}
                                onMouseDown={(e) => handleHandleMouseDown(e, shape.id, 'sw')} style={{ cursor: 'nesw-resize' }} />
                            {/* BR */}
                            <rect x={shape.x + shape.width - 4 / zoom} y={shape.y + shape.height - 4 / zoom} width={8 / zoom} height={8 / zoom}
                                fill="white" stroke="hsl(var(--color-accent))" strokeWidth={1 / zoom}
                                onMouseDown={(e) => handleHandleMouseDown(e, shape.id, 'se')} style={{ cursor: 'nwse-resize' }} />

                            {/* Rotation Handle */}
                            <line
                                x1={shape.x + shape.width / 2} y1={shape.y}
                                x2={shape.x + shape.width / 2} y2={shape.y - 20 / zoom}
                                stroke="hsl(var(--color-accent))" strokeWidth={1 / zoom}
                            />
                            <circle
                                cx={shape.x + shape.width / 2} cy={shape.y - 20 / zoom} r={4 / zoom}
                                fill="white" stroke="hsl(var(--color-accent))" strokeWidth={1 / zoom}
                                onMouseDown={(e) => handleHandleMouseDown(e, shape.id, 'rotate')} style={{ cursor: 'grab' }}
                            />
                        </>
                    )}
                </g>
            </React.Fragment>
        );
    };

    return (
        <div
            ref={containerRef}
            style={{
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                position: 'relative',
                cursor: activeTool === 'select' ? 'default' : 'crosshair',
                userSelect: 'none'
            }}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <svg width="100%" height="100%" style={{ display: 'block' }}>
                <defs>
                    <pattern
                        id="dot-grid"
                        x={offset.x % (gridSize * zoom)}
                        y={offset.y % (gridSize * zoom)}
                        width={gridSize * zoom}
                        height={gridSize * zoom}
                        patternUnits="userSpaceOnUse"
                    >
                        <circle cx="1" cy="1" r="1" fill="hsl(var(--color-border))" />
                    </pattern>
                </defs>

                <rect width="100%" height="100%" fill="url(#dot-grid)" onMouseDown={handleMouseDown} />

                <g transform={`translate(${offset.x}, ${offset.y}) scale(${zoom})`}>
                    {[...shapes, ...(drawingShape ? [drawingShape] : [])].map((shape) => renderShape(shape))}

                    {isSelecting && (
                        <rect
                            x={Math.min(selectionStart.x, selectionEnd.x)}
                            y={Math.min(selectionStart.y, selectionEnd.y)}
                            width={Math.abs(selectionEnd.x - selectionStart.x)}
                            height={Math.abs(selectionEnd.y - selectionStart.y)}
                            fill="hsl(var(--color-accent))"
                            fillOpacity={0.1}
                            stroke="hsl(var(--color-accent))"
                            strokeWidth={1 / zoom}
                            vectorEffect="non-scaling-stroke"
                            style={{ pointerEvents: 'none' }}
                        />
                    )}
                </g>
            </svg>

            {/* HUD */}
            <div style={{ position: 'absolute', bottom: 16, left: 16, background: 'hsl(var(--color-bg-panel))', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', border: '1px solid hsl(var(--color-border))', pointerEvents: 'none', color: 'hsl(var(--color-text-secondary))' }}>
                {Math.round(zoom * 100)}% | {Math.round(offset.x)}, {Math.round(offset.y)}
            </div>
        </div>
    );
}
