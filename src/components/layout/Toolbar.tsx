'use client';

import { useState } from 'react';
import { useCanvasStore } from "@/store/canvasStore";
import { ArtboardModal } from "@/components/modals/ArtboardModal";
import { TemplatesModal } from "@/components/modals/TemplatesModal";
import { AssetsModal } from "@/components/modals/AssetsModal";
import { SaveModal } from "@/components/modals/SaveModal";
import { OpenModal } from "@/components/modals/OpenModal";
import { FolderOpen, Save, Layout, LayoutTemplate, Image as ImageIcon, Undo2, Redo2, Hexagon, Circle } from 'lucide-react';
import styles from './Toolbar.module.css';

export function Toolbar() {
    const { activeTool, undo, redo, past, future, newProject } = useCanvasStore();
    const [showArtboardModal, setShowArtboardModal] = useState(false);
    const [showTemplatesModal, setShowTemplatesModal] = useState(false);
    const [assetsModalType, setAssetsModalType] = useState<'logos' | 'shapes' | 'photos' | null>(null);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showOpenModal, setShowOpenModal] = useState(false);

    const handleNew = () => {
        newProject(); // opens a new blank tab
    };

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", fontWeight: 500, width: '100%', height: '100%' }}>
            {/* Left Side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifySelf: 'start' }}>
                <span style={{ marginRight: "8px", fontSize: "1.1rem" }}>
                    <span style={{ color: "#00DEF8" }}>NBG</span> Canvas
                </span>
                <button className={styles.actionButton} onClick={handleNew}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg> New
                </button>
                <button className={styles.actionButton} onClick={() => setShowOpenModal(true)}>
                    <FolderOpen size={16} /> Open
                </button>
                <button className={styles.actionButton} onClick={() => setShowSaveModal(true)}>
                    <Save size={16} /> Save
                </button>
                <div style={{ width: '1px', height: '24px', backgroundColor: 'hsl(var(--color-border))', margin: '0 4px' }} />
                <button onClick={undo} disabled={past.length === 0} className={styles.actionButton}>
                    <Undo2 size={16} /> Undo
                </button>
                <button onClick={redo} disabled={future.length === 0} className={styles.actionButton}>
                    <Redo2 size={16} /> Redo
                </button>
            </div>

            {/* Center Tools */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifySelf: 'center'
            }}>
            </div>

            {/* Right Side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifySelf: 'end' }}>
                <button className={styles.toolButton} onClick={() => setAssetsModalType('logos')}>
                    <Hexagon size={16} color="#00DEF8" /> NBG Logos
                </button>
                <button className={styles.toolButton} onClick={() => setAssetsModalType('shapes')}>
                    <Circle size={16} color="#00DEF8" /> NBG Ellipses
                </button>
                <button className={styles.toolButton} onClick={() => setAssetsModalType('photos')}>
                    <ImageIcon size={16} color="#00DEF8" /> NBG Photos
                </button>
                <button className={styles.toolButton} onClick={() => setShowTemplatesModal(true)}>
                    <LayoutTemplate size={16} color="#00DEF8" /> NBG Templates
                </button>
                <button className={styles.toolButton} data-active={activeTool === 'artboard'} onClick={() => setShowArtboardModal(true)}>
                    <Layout size={16} color="#00DEF8" /> SoMe Templates
                </button>
            </div>

            <ArtboardModal isOpen={showArtboardModal} onClose={() => setShowArtboardModal(false)} />
            <TemplatesModal isOpen={showTemplatesModal} onClose={() => setShowTemplatesModal(false)} />
            <AssetsModal isOpen={assetsModalType !== null} type={assetsModalType} onClose={() => setAssetsModalType(null)} />
            <SaveModal isOpen={showSaveModal} onClose={() => setShowSaveModal(false)} />
            <OpenModal isOpen={showOpenModal} onClose={() => setShowOpenModal(false)} />
        </div>
    );
}
