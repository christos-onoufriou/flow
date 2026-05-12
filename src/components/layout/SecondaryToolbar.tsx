'use client';

import { useRef } from 'react';
import { useCanvasStore, Shape } from "@/store/canvasStore";
import { Dropdown } from "@/components/ui/Dropdown";
import { MousePointer2, Hand, ZoomIn, ZoomOut, Search, Type, Square, Circle, Minus, Image as ImageIcon, Video, Layout } from 'lucide-react';
import styles from './Toolbar.module.css';

export function SecondaryToolbar() {
    const { activeTool, setActiveTool, addShape, offset, zoom } = useCanvasStore();
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
                    const maxDim = 480;
                    const scale = Math.min(1, maxDim / Math.max(originalWidth, originalHeight));
                    const width = originalWidth * scale;
                    const height = originalHeight * scale;

                    const { selectedIds, shapes, offset, zoom } = useCanvasStore.getState();
                    const selectedId = selectedIds.length === 1 ? selectedIds[0] : null;
                    const selectedShape = selectedId ? shapes.find(s => s.id === selectedId) : null;
                    const isArtboardSelected = selectedShape?.type === 'artboard';

                    let x: number, y: number;

                    if (isArtboardSelected && selectedShape) {
                        const artboard = selectedShape;
                        x = (artboard.width - width) / 2;
                        y = (artboard.height - height) / 2;

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
                            aspectRatioLocked: true
                        };
                        addShape(newShape);
                        useCanvasStore.getState().moveToArtboard(newShape.id, artboard.id);

                    } else {
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
                            aspectRatioLocked: true
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
        e.target.value = '';
    };

    return (
        <>
            <div style={{
                position: 'absolute',
                top: '56px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'hsl(var(--color-bg-panel))',
                border: '1px solid hsl(var(--color-border))',
                borderRadius: 'var(--radius-md)',
                padding: '4px',
                display: 'flex',
                gap: '8px',
                boxShadow: 'var(--shadow-md)',
                zIndex: 100
            }}>
                <button className={styles.toolButton} data-active={activeTool === 'select'} onClick={() => setActiveTool('select')}>
                    <MousePointer2 size={16} /> Select
                </button>
                <button className={styles.toolButton} data-active={activeTool === 'hand'} onClick={() => setActiveTool('hand')}>
                    <Hand size={16} /> Move
                </button>

                <Dropdown
                    label={<div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Search size={16} /> Zoom</div>}
                    isActive={['zoom', 'zoom-out'].includes(activeTool)}
                    className={styles.toolButton}
                >
                    <div onClick={() => setActiveTool('zoom')} className={styles.dropdownItem} data-active={activeTool === 'zoom'}>
                        <ZoomIn size={14} /> Zoom in
                    </div>
                    <div onClick={() => setActiveTool('zoom-out')} className={styles.dropdownItem} data-active={activeTool === 'zoom-out'}>
                        <ZoomOut size={14} /> Zoom out
                    </div>
                </Dropdown>

                <button className={styles.toolButton} data-active={activeTool === 'text'} onClick={() => setActiveTool('text')}>
                    <Type size={16} /> Text
                </button>

                <Dropdown
                    label={<div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Square size={16} /> Shapes</div>}
                    isActive={['rectangle', 'ellipse', 'line'].includes(activeTool)}
                    className={styles.toolButton}
                >
                    <div onClick={() => setActiveTool('rectangle')} className={styles.dropdownItem} data-active={activeTool === 'rectangle'}>
                        <Square size={14} /> Rectangle
                    </div>
                    <div onClick={() => setActiveTool('ellipse')} className={styles.dropdownItem} data-active={activeTool === 'ellipse'}>
                        <Circle size={14} /> Ellipse
                    </div>
                    <div onClick={() => setActiveTool('line')} className={styles.dropdownItem} data-active={activeTool === 'line'}>
                        <Minus size={14} /> Line
                    </div>
                </Dropdown>

                <Dropdown
                    label={<div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ImageIcon size={16} /> Media</div>}
                    className={styles.toolButton}
                >
                    <div onClick={() => handleMediaClick('image')} className={styles.dropdownItem}>
                        <ImageIcon size={14} /> Image
                    </div>
                    <div onClick={() => handleMediaClick('video')} className={styles.dropdownItem}>
                        <Video size={14} /> Video
                    </div>
                </Dropdown>

                <button className={styles.toolButton} data-active={activeTool === 'draw-artboard'} onClick={() => setActiveTool('draw-artboard')}>
                    <Layout size={16} /> New Artboard
                </button>
            </div>
            
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                accept="image/*,video/*"
            />
        </>
    );
}
