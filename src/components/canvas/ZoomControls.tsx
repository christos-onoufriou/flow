'use client';

import React, { useState, useEffect } from 'react';
import { useCanvasStore } from "@/store/canvasStore";
import { ChevronDown, ChevronUp } from 'lucide-react';

const PRESETS = [25, 50, 75, 100, 125, 150, 175, 200, 250, 300, 400];

export function ZoomControls() {
    const { zoom, setZoom, offset } = useCanvasStore();
    const [inputValue, setInputValue] = useState(Math.round(zoom * 100).toString());
    const [isOpen, setIsOpen] = useState(false);

    // Sync input with external zoom changes (e.g. wheel)
    useEffect(() => {
        if (!isOpen) { // Don't overwrite if user is interacting with menu (though input is separate)
            // Only update if not currently focused? For simplicity, update on blur or key logic usually.
            // But if I scroll wheel, I want the number to update.
            // If I am typing, I don't want it to jump.
            // For now, let's update whenever zoom changes, unless focused (not easily detected without ref tracking)
            // Simpler: Just update. If typing and external zoom happens, it might conflict, but external zoom usually requires mouse action.
            setInputValue(Math.round(zoom * 100).toString());
        }
    }, [zoom, isOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleInputBlur = () => {
        commitZoom();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            commitZoom();
            (e.target as HTMLInputElement).blur();
        }
    };

    const commitZoom = () => {
        let val = parseInt(inputValue, 10);
        if (isNaN(val)) {
            // Revert
            setInputValue(Math.round(zoom * 100).toString());
            return;
        }

        // Clamp
        if (val < 10) val = 10;
        if (val > 1000) val = 1000;

        setZoom(val / 100);
        setInputValue(val.toString());
    };

    const handlePresetClick = (preset: number) => {
        setZoom(preset / 100);
        setIsOpen(false);
    };

    return (
        <div style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'hsl(var(--color-bg-panel))',
            padding: '4px 8px',
            borderRadius: '6px',
            border: '1px solid hsl(var(--color-border))',
            boxShadow: 'var(--shadow-sm)',
            fontSize: 'var(--text-sm)',
            color: 'hsl(var(--color-text-secondary))',
            pointerEvents: 'auto'
        }}>
            {/* Zoom Input Group */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                    type="text"
                    value={inputValue + '%'}
                    onChange={(e) => setInputValue(e.target.value.replace('%', ''))}
                    onBlur={handleInputBlur}
                    onKeyDown={handleKeyDown}
                    style={{
                        width: '48px',
                        background: 'transparent',
                        border: 'none',
                        color: 'hsl(var(--color-text-primary))',
                        textAlign: 'right',
                        outline: 'none',
                        fontWeight: 500,
                        fontSize: 'var(--text-sm)'
                    }}
                />

                {/* Dropdown Trigger */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    style={{
                        marginLeft: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        color: 'hsl(var(--color-text-muted))',
                        padding: '2px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                    className="hover:bg-white/5"
                >
                    {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div style={{
                        position: 'absolute',
                        bottom: '100%',
                        left: 0,
                        marginBottom: '4px',
                        backgroundColor: 'hsl(var(--color-bg-panel))',
                        border: '1px solid hsl(var(--color-border))',
                        borderRadius: '6px',
                        padding: '4px',
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100px',
                        boxShadow: 'var(--shadow-md)',
                        maxHeight: '200px',
                        overflowY: 'auto'
                    }}>
                        {PRESETS.map(preset => (
                            <button
                                key={preset}
                                onClick={() => handlePresetClick(preset)}
                                style={{
                                    textAlign: 'left',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    backgroundColor: Math.round(zoom * 100) === preset ? 'hsl(var(--color-accent))' : 'transparent',
                                    color: Math.round(zoom * 100) === preset ? 'white' : 'hsl(var(--color-text-secondary))',
                                    fontSize: 'var(--text-sm)',
                                    cursor: 'pointer',
                                    border: 'none'
                                }}
                                className={Math.round(zoom * 100) !== preset ? "hover:bg-white/5" : ""}
                            >
                                {preset}%
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ width: '1px', height: '16px', background: 'hsl(var(--color-border))' }} />

            {/* Coordinates */}
            <div style={{ userSelect: 'none', minWidth: '80px', textAlign: 'center' }}>
                {Math.round(offset.x)}, {Math.round(offset.y)}
            </div>
        </div>
    );
}
