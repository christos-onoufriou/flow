'use client';

import { useState, useRef } from 'react';
import { useCanvasStore, Shape } from "@/store/canvasStore";
import { ArtboardModal } from "@/components/modals/ArtboardModal";
import { TemplatesModal } from "@/components/modals/TemplatesModal";
import { AssetsModal } from "@/components/modals/AssetsModal";
import { Dropdown } from "@/components/ui/Dropdown";
import { ArrowLeft, ArrowRight, FolderOpen, Save, MousePointer2, Type, Square, Image as ImageIcon, Layout, LayoutTemplate, Box } from 'lucide-react';
import styles from './Toolbar.module.css';

export function Toolbar() {
    const { activeTool, setActiveTool, undo, redo, past, future, addShape, offset, zoom } = useCanvasStore();
    const [showArtboardModal, setShowArtboardModal] = useState(false);
    const [showTemplatesModal, setShowTemplatesModal] = useState(false);
    const [showAssetsModal, setShowAssetsModal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mediaTypeRef = useRef<'image' | 'video' | null>(null);

    const handleMediaClick = (type: 'image' | 'video') => {
        mediaTypeRef.current = type;
        if (fileInputRef.current) {
            fileInputRef.current.accept = type === 'image' ? "image/*" : "video/*";
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !mediaTypeRef.current) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                const src = event.target.result as string;
                const type = mediaTypeRef.current!;

                const createShape = (originalWidth: number, originalHeight: number) => {
                    // 1. Max Limit 480px
                    const maxDim = 480;
                    const scale = Math.min(1, maxDim / Math.max(originalWidth, originalHeight));
                    const width = originalWidth * scale;
                    const height = originalHeight * scale;

                    // 2. Parenting Logic
                    const { selectedIds, shapes, offset, zoom } = useCanvasStore.getState(); // Get fresh state
                    const selectedId = selectedIds.length === 1 ? selectedIds[0] : null;
                    const selectedShape = selectedId ? shapes.find(s => s.id === selectedId) : null;

                    const isArtboardSelected = selectedShape?.type === 'artboard';

                    let x: number, y: number;
                    let parentId: string | undefined;

                    if (isArtboardSelected && selectedShape) {
                        // Center in Artboard
                        const artboard = selectedShape;
                        // Center relative to Artboard: (ArtboardW - ImageW) / 2
                        x = (artboard.width - width) / 2;
                        y = (artboard.height - height) / 2;

                        // We will add to root first then move, OR easier:
                        // Just create it, then we need to insert it into the children of the artboard.
                        // But addShape adds to root. modifying addShape is complex in store.
                        // We can use the store's moveLayer or just modify the shape before adding? 
                        // Wait, addShape only pushes to root properties. 
                        // To add as child, we should use 'updateShape' on the parent?
                        // No, store structure is recursive. We need to add it to the parent's children array.
                        // Best approach with current store API:
                        // 1. Add to root (at absolute position matching the calculated relative position)
                        // 2. Move to artboard using moveToArtboard? 
                        // moveToArtboard implementation: x = shape.x - artboard.x.
                        // So if we want relative X, we should set absolute X = artboard.x + relativeX.

                        // Absolute coords for 'addShape' to work with 'moveToArtboard' later:
                        const absoluteX = artboard.x + x;
                        const absoluteY = artboard.y + y;

                        const newShape: Shape = {
                            id: crypto.randomUUID(),
                            type: type,
                            x: absoluteX,
                            y: absoluteY,
                            width: width,
                            height: height,
                            fill: 'transparent',
                            src: src,
                            aspectRatioLocked: true // Default lock for media
                        };
                        addShape(newShape);

                        // Immediate move to artboard
                        // We need access to moveToArtboard from store.
                        useCanvasStore.getState().moveToArtboard(newShape.id, artboard.id);

                    } else {
                        // Viewport Center
                        // Viewport Center in Screen Coords: window.innerWidth / 2, window.innerHeight / 2
                        // Convert to World Coords: (Screen - Offset) / Zoom
                        const cx = (window.innerWidth / 2 - offset.x) / zoom;
                        const cy = (window.innerHeight / 2 - offset.y) / zoom;

                        x = cx - width / 2;
                        y = cy - height / 2;

                        const newShape: Shape = {
                            id: crypto.randomUUID(),
                            type: type,
                            x: x,
                            y: y,
                            width: width,
                            height: height,
                            fill: 'transparent',
                            src: src,
                            aspectRatioLocked: true // Default lock for media
                        };
                        addShape(newShape);
                    }
                };

                if (type === 'image') {
                    const img = new Image();
                    img.onload = () => createShape(img.naturalWidth, img.naturalHeight);
                    img.src = src;
                } else {
                    const video = document.createElement('video');
                    video.onloadedmetadata = () => createShape(video.videoWidth, video.videoHeight);
                    video.src = src;
                }
            }
        };
        reader.readAsDataURL(file);
        // Reset input
        e.target.value = '';
    };



    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", fontWeight: 500, width: '100%', height: '100%' }}>
            {/* Left Side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifySelf: 'start' }}>
                <span style={{ marginRight: "16px", fontSize: "1.1rem" }}><span style={{ color: "#00DEF8" }}>NBG</span> Creative Studio</span>


                <button className={styles.actionButton}>
                    <FolderOpen size={16} /> Open
                </button>
                <button className={styles.actionButton}>
                    <Save size={16} /> Save
                </button>

            </div>

            {/* Center Tools */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                justifySelf: 'center'
            }}>
                <button className={styles.toolButton} data-active={activeTool === 'select'} onClick={() => setActiveTool('select')}>
                    <MousePointer2 size={16} /> Select
                </button>
                <button className={styles.toolButton} data-active={activeTool === 'text'} onClick={() => setActiveTool('text')}>
                    <Type size={16} /> Text
                </button>

                <Dropdown
                    label={<div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Square size={16} /> Shapes</div>}
                    isActive={['rectangle', 'ellipse', 'line'].includes(activeTool)}
                    className={styles.toolButton}
                >
                    <div onClick={() => setActiveTool('rectangle')} style={{ cursor: 'pointer', padding: "4px 8px", borderRadius: "var(--radius-sm)", fontSize: "var(--text-sm)", backgroundColor: activeTool === 'rectangle' ? "hsl(var(--color-accent))" : "transparent", color: activeTool === 'rectangle' ? "hsl(var(--color-accent-fg))" : "inherit", border: 'none', textAlign: 'left', width: '100%' }}>Rectangle</div>
                    <div onClick={() => setActiveTool('ellipse')} style={{ cursor: 'pointer', padding: "4px 8px", borderRadius: "var(--radius-sm)", fontSize: "var(--text-sm)", backgroundColor: activeTool === 'ellipse' ? "hsl(var(--color-accent))" : "transparent", color: activeTool === 'ellipse' ? "hsl(var(--color-accent-fg))" : "inherit", border: 'none', textAlign: 'left', width: '100%' }}>Ellipse</div>
                    <div onClick={() => setActiveTool('line')} style={{ cursor: 'pointer', padding: "4px 8px", borderRadius: "var(--radius-sm)", fontSize: "var(--text-sm)", backgroundColor: activeTool === 'line' ? "hsl(var(--color-accent))" : "transparent", color: activeTool === 'line' ? "hsl(var(--color-accent-fg))" : "inherit", border: 'none', textAlign: 'left', width: '100%' }}>Line</div>
                </Dropdown>

                <Dropdown
                    label={<div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ImageIcon size={16} /> Media</div>}
                    className={styles.toolButton}
                >
                    <div onClick={() => handleMediaClick('image')} style={{ padding: '8px', cursor: 'pointer', fontSize: "var(--text-sm)" }}>Image</div>
                    <div onClick={() => handleMediaClick('video')} style={{ padding: '8px', cursor: 'pointer', fontSize: "var(--text-sm)" }}>Video</div>
                </Dropdown>

                <button className={styles.toolButton} data-active={activeTool === 'artboard'} onClick={() => setShowArtboardModal(true)}>
                    <Layout size={16} /> Artboard
                </button>
                <button className={styles.toolButton} onClick={() => setShowTemplatesModal(true)}>
                    <LayoutTemplate size={16} /> Templates
                </button>
                <button className={styles.toolButton} onClick={() => setShowAssetsModal(true)}>
                    <Box size={16} /> Assets
                </button>
            </div>

            {/* Right Side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifySelf: 'end' }}>

                <button onClick={undo} disabled={past.length === 0} className={styles.actionButton}>
                    <ArrowLeft size={16} /> Undo
                </button>
                <button onClick={redo} disabled={future.length === 0} className={styles.actionButton}>
                    <ArrowRight size={16} /> Redo
                </button>
            </div>


            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                accept="image/*,video/*"
            />

            <ArtboardModal isOpen={showArtboardModal} onClose={() => setShowArtboardModal(false)} />
            <TemplatesModal isOpen={showTemplatesModal} onClose={() => setShowTemplatesModal(false)} />
            <AssetsModal isOpen={showAssetsModal} onClose={() => setShowAssetsModal(false)} />
        </div>
    );
}
