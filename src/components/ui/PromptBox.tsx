'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowUp, Upload, Plus, Type, Image as ImageIcon } from 'lucide-react';
import styles from './PromptBox.module.css';

export function PromptBox() {
    const [prompt, setPrompt] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [mode, setMode] = useState<'text' | 'image' | null>(null); // 'text' | 'image' | null (auto)
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Prompt submitted:', prompt, 'Image:', selectedImage ? 'Yes' : 'No', 'Mode:', mode || 'Auto');
        // Logic will be added later
        setPrompt('');
        setSelectedImage(null);
        setMode(null);
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (typeof event.target?.result === 'string') {
                    setSelectedImage(event.target.result);
                }
            };
            reader.readAsDataURL(file);
        }
        // Reset input
        e.target.value = '';
    };

    const removeImage = () => {
        setSelectedImage(null);
    };

    return (
        <div className={styles.container}>
            {selectedImage && (
                <div className={styles.previewContainer}>
                    <div className={styles.previewImageWrapper}>
                        <img src={selectedImage} alt="Reference" className={styles.previewImage} />
                        <button onClick={removeImage} className={styles.removeImageButton}>×</button>
                    </div>
                </div>
            )}
            <div className={styles.inputWrapper}>
                <form onSubmit={handleSubmit} className={styles.topRow}>
                    <div style={{ padding: '0 4px', color: 'hsl(var(--color-text-secondary))', display: 'flex', alignItems: 'center' }}>
                        <Sparkles size={18} />
                    </div>

                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ask AI to generate copy or images..."
                        className={styles.input}
                        autoFocus
                    />
                    <button
                        type="submit"
                        className={styles.sendButton}
                        disabled={!prompt.trim() && !selectedImage}
                    >
                        <ArrowUp size={18} strokeWidth={2.5} />
                    </button>
                </form>

                <div className={styles.toolsRow}>
                    <button type="button" className={styles.smallIconButton} onClick={handleImageClick} title="Add Reference / Import Image">
                        <Plus size={14} />
                    </button>
                    <button
                        type="button"
                        className={styles.smallIconButton}
                        title="Generate Text"
                        style={{ color: mode === 'text' ? '#00DEF8' : undefined }}
                        onClick={() => setMode(mode === 'text' ? null : 'text')}
                    >
                        <Type size={14} />
                    </button>
                    <button
                        type="button"
                        className={styles.smallIconButton}
                        title="Generate Image"
                        style={{ color: mode === 'image' ? '#00DEF8' : undefined }}
                        onClick={() => setMode(mode === 'image' ? null : 'image')}
                    >
                        <ImageIcon size={14} />
                    </button>

                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </div>
            </div>
        </div>
    );
}
