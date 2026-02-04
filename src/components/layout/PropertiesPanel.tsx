'use client';
import React, { useState } from 'react';

import { useCanvasStore } from "@/store/canvasStore";
import { exportSelectionToSVG, exportSelectionToPNG } from "@/utils/exportUtils";
import { findShape } from "@/utils/shapeUtils";

export function PropertiesPanel() {
    return (
        <>
            <style jsx global>{`
                .no-spin::-webkit-inner-spin-button, 
                .no-spin::-webkit-outer-spin-button { 
                    -webkit-appearance: none; 
                    margin: 0; 
                }
                .no-spin {
                    -moz-appearance: textfield;
                }
            `}</style>
            <PropertiesPanelContent />
        </>
    );
}

function PropertiesPanelContent() {
    const { selectedIds, shapes, updateShape, reorderShape, saveSnapshot, alignShapes, distributeShapes, addTemplate } = useCanvasStore();

    const [activePopup, setActivePopup] = useState<string | null>(null);
    // ... (lines 31-447 unchanged effectively, just context)

    if (selectedIds.length === 0) {
        return (
            <div style={{ padding: "var(--space-4)" }}>
                <h3 style={{ fontSize: "var(--text-sm)", color: "hsl(var(--color-text-muted))", marginBottom: "var(--space-4)", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Properties</h3>
                <div style={{ fontSize: "var(--text-sm)", color: "hsl(var(--color-text-secondary))" }}>No selection</div>
                <h3 style={{ fontSize: "var(--text-sm)", color: "hsl(var(--color-text-muted))", marginBottom: "var(--space-4)", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Properties</h3>
                <div style={{ fontSize: "var(--text-sm)", color: "hsl(var(--color-text-secondary))", marginBottom: "var(--space-4)" }}>No selection</div>

                <div style={{ borderTop: "1px solid hsl(var(--color-border))", paddingTop: "var(--space-4)" }}>
                    <h3 style={{ fontSize: "var(--text-sm)", color: "hsl(var(--color-text-muted))", marginBottom: "var(--space-2)", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Export Canvas</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <button onClick={() => exportSelectionToSVG(shapes, 'canvas.svg')} style={buttonStyle}>SVG</button>
                        <button onClick={() => exportSelectionToPNG(shapes, 'canvas.png')} style={buttonStyle}>PNG</button>
                    </div>
                </div>
            </div>
        );
    }

    if (selectedIds.length > 1) {
        return (
            <div style={{ padding: "var(--space-4)" }}>
                <h3 style={{ fontSize: "var(--text-sm)", color: "hsl(var(--color-text-muted))", marginBottom: "var(--space-4)", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Selection ({selectedIds.length})</h3>

                {/* Alignment */}
                <div style={{ marginTop: 'var(--space-2)' }}>
                    <label style={{ fontSize: "var(--text-sm)", color: "hsl(var(--color-text-muted))", display: 'block', marginBottom: '8px' }}>Align</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px', marginBottom: '8px' }}>
                        <button title="Align Left" onClick={() => alignShapes('left')} style={buttonStyle}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="2" width="2" height="20" /><rect x="6" y="6" width="12" height="4" /><rect x="6" y="14" width="8" height="4" /></svg>
                        </button>
                        <button title="Align Center" onClick={() => alignShapes('center')} style={buttonStyle}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="11" y="2" width="2" height="20" /><rect x="4" y="6" width="16" height="4" /><rect x="6" y="14" width="12" height="4" /></svg>
                        </button>
                        <button title="Align Right" onClick={() => alignShapes('right')} style={buttonStyle}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="20" y="2" width="2" height="20" /><rect x="6" y="6" width="12" height="4" /><rect x="10" y="14" width="8" height="4" /></svg>
                        </button>
                        <button title="Align Top" onClick={() => alignShapes('top')} style={buttonStyle}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="2" width="20" height="2" /><rect x="6" y="6" width="4" height="12" /><rect x="14" y="6" width="4" height="8" /></svg>
                        </button>
                        <button title="Align Middle" onClick={() => alignShapes('middle')} style={buttonStyle}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="11" width="20" height="2" /><rect x="6" y="4" width="4" height="16" /><rect x="14" y="6" width="4" height="12" /></svg>
                        </button>
                        <button title="Align Bottom" onClick={() => alignShapes('bottom')} style={buttonStyle}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="20" width="20" height="2" /><rect x="6" y="6" width="4" height="12" /><rect x="14" y="10" width="4" height="8" /></svg>
                        </button>
                    </div>

                    <label style={{ fontSize: "var(--text-sm)", color: "hsl(var(--color-text-muted))", display: 'block', marginBottom: '8px' }}>Distribute</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px' }}>
                        <button title="Distribute Horizontal" onClick={() => distributeShapes('horizontal')} style={buttonStyle}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="4" width="2" height="16" /><rect x="20" y="4" width="2" height="16" /><rect x="11" y="4" width="2" height="16" /></svg>
                        </button>
                        <button title="Distribute Vertical" onClick={() => distributeShapes('vertical')} style={buttonStyle}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="2" width="16" height="2" /><rect x="4" y="20" width="16" height="2" /><rect x="4" y="11" width="16" height="2" /></svg>
                        </button>
                    </div>

                </div>

                <div style={{ borderTop: "1px solid hsl(var(--color-border))", paddingTop: "var(--space-4)", marginTop: "var(--space-4)" }}>
                    <h3 style={{ fontSize: "var(--text-sm)", color: "hsl(var(--color-text-muted))", marginBottom: "var(--space-2)", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Export Selection</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <button onClick={() => exportSelectionToSVG(shapes.filter(s => selectedIds.includes(s.id)), 'selection.svg')} style={buttonStyle}>SVG</button>
                        <button onClick={() => exportSelectionToPNG(shapes.filter(s => selectedIds.includes(s.id)), 'selection.png')} style={buttonStyle}>PNG</button>
                    </div>
                </div>
            </div >
        );
    }

    // Multi-selection not fully supported in UI yet, just show first
    const primaryId = selectedIds[0];
    const shape = findShape(shapes, primaryId);

    if (!shape) return null;

    const handleChange = (key: keyof typeof shape, value: any, key2?: keyof typeof shape, value2?: any) => {
        saveSnapshot(); // Save before update
        if (key2 && value2 !== undefined) {
            updateShape(primaryId, { [key]: value, [key2]: value2 });
        } else {
            updateShape(primaryId, { [key]: value });
        }
    };

    const handleReorder = (action: 'front' | 'back' | 'forward' | 'backward') => {
        saveSnapshot();
        reorderShape(primaryId, action);
    };

    return (
        <div style={{ padding: "var(--space-4)" }}>
            <h3 style={{ fontSize: "var(--text-sm)", color: "hsl(var(--color-text-muted))", marginBottom: "var(--space-4)", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Properties</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {/* Identity */}
                <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, textTransform: 'capitalize' }}>
                    {shape.type}
                </div>

                {/* Dimensions / Coordinates */}
                {/* Dimensions / Coordinates */}
                {shape.type === 'line' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
                        <LabelInput label="X1" value={Math.round(shape.x)} onChange={(v) => handleChange('x', Number(v))} />
                        <LabelInput label="Y1" value={Math.round(shape.y)} onChange={(v) => handleChange('y', Number(v))} />
                        <LabelInput label="X2" value={Math.round(shape.x2 ?? shape.x)} onChange={(v) => handleChange('x2', Number(v))} />
                        <LabelInput label="Y2" value={Math.round(shape.y2 ?? shape.y)} onChange={(v) => handleChange('y2', Number(v))} />
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
                            <LabelInput label="X" value={Math.round(shape.x)} onChange={(v) => handleChange('x', Number(v))} />
                            <LabelInput label="Y" value={Math.round(shape.y)} onChange={(v) => handleChange('y', Number(v))} />
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                            <div style={{ flex: 1 }}>
                                <LabelInput
                                    label="W"
                                    value={Math.round(shape.width)}
                                    onChange={(v) => {
                                        const newW = Number(v);
                                        if (shape.aspectRatioLocked) {
                                            const ratio = shape.height / shape.width;
                                            handleChange('height', newW * ratio, 'width', newW);
                                        } else {
                                            handleChange('width', newW);
                                        }
                                    }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <LabelInput
                                    label="H"
                                    value={Math.round(shape.height)}
                                    onChange={(v) => {
                                        const newH = Number(v);
                                        if (shape.aspectRatioLocked) {
                                            const ratio = shape.width / shape.height;
                                            handleChange('width', newH * ratio, 'height', newH);
                                        } else {
                                            handleChange('height', newH);
                                        }
                                    }}
                                />
                            </div>
                            <button
                                onClick={() => handleChange('aspectRatioLocked', !shape.aspectRatioLocked)}
                                title={shape.aspectRatioLocked ? "Unlock Aspect Ratio" : "Lock Aspect Ratio"}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    color: shape.aspectRatioLocked ? 'hsl(var(--color-accent))' : 'hsl(var(--color-text-muted))',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                {shape.aspectRatioLocked ? (
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                ) : (
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
                                )}
                            </button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
                            <LabelInput label="R" value={Math.round(shape.rotation || 0)} onChange={(v) => handleChange('rotation', Number(v))} />
                        </div>
                    </div>
                )}

                {/* Appearance */}
                <div style={{ marginTop: 'var(--space-2)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {shape.type === 'text' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div>
                                <label style={{ fontSize: "var(--text-sm)", color: "hsl(var(--color-text-muted))", display: 'block', marginBottom: '4px' }}>Content</label>
                                <textarea
                                    value={shape.textContent || ''}
                                    onChange={(e) => handleChange('textContent', e.target.value)}
                                    style={{
                                        width: '100%',
                                        background: 'hsl(var(--color-bg-app))',
                                        border: '1px solid hsl(var(--color-border))',
                                        borderRadius: '4px',
                                        color: 'hsl(var(--color-text-primary))',
                                        padding: '4px',
                                        fontSize: '12px',
                                        minHeight: '40px',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>
                            {/* Row 1: Font and Weight */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <label style={{ fontSize: '10px', color: 'hsl(var(--color-text-muted))', marginBottom: '2px' }}>Font</label>
                                    <select
                                        value={shape.fontFamily || 'var(--font-aeonik-pro)'}
                                        onChange={(e) => handleChange('fontFamily', e.target.value)}
                                        style={{
                                            background: 'hsl(var(--color-bg-app))',
                                            border: '1px solid hsl(var(--color-border))',
                                            borderRadius: '4px',
                                            color: 'hsl(var(--color-text-primary))',
                                            padding: '0 4px',
                                            fontSize: '12px',
                                            outline: 'none',
                                            width: '100%',
                                            height: '24px',
                                            boxSizing: 'border-box'
                                        }}
                                    >
                                        <option value="var(--font-aeonik-pro)">Aeonik Pro</option>
                                        <option value="var(--font-roboto)">Roboto</option>
                                        <option value="var(--font-open-sans)">Open Sans</option>
                                        <option value="var(--font-lato)">Lato</option>
                                        <option value="serif">Serif</option>
                                        <option value="monospace">Mono</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <label style={{ fontSize: '10px', color: 'hsl(var(--color-text-muted))', marginBottom: '2px' }}>Weight</label>
                                    <select
                                        value={shape.fontWeight || '400'}
                                        onChange={(e) => handleChange('fontWeight', e.target.value)}
                                        style={{
                                            background: 'hsl(var(--color-bg-app))',
                                            border: '1px solid hsl(var(--color-border))',
                                            borderRadius: '4px',
                                            color: 'hsl(var(--color-text-primary))',
                                            padding: '0 4px',
                                            fontSize: '12px',
                                            outline: 'none',
                                            width: '100%',
                                            height: '24px',
                                            boxSizing: 'border-box'
                                        }}
                                    >
                                        <option value="100">Air</option>
                                        <option value="200">Thin</option>
                                        <option value="300">Light</option>
                                        <option value="400">Normal</option>
                                        <option value="500">Medium</option>
                                        <option value="700">Bold</option>
                                        <option value="900">Black</option>
                                    </select>
                                </div>
                            </div>

                            {/* Row 2: Size, Style, Align */}
                            <div style={{ display: 'grid', gridTemplateColumns: '80px 40px 1fr', gap: 'var(--space-2)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <label style={{ fontSize: '10px', color: 'hsl(var(--color-text-muted))', marginBottom: '2px' }}>Size</label>
                                    <input
                                        type="number"
                                        value={shape.fontSize || 16}
                                        onChange={(e) => handleChange('fontSize', Number(e.target.value))}
                                        className="no-spin"
                                        style={{
                                            background: 'hsl(var(--color-bg-app))',
                                            border: '1px solid hsl(var(--color-border))',
                                            borderRadius: '4px',
                                            color: 'hsl(var(--color-text-primary))',
                                            padding: '0 4px', // Reduced top/bottom padding, rely on height/flex
                                            fontSize: '12px',
                                            outline: 'none',
                                            width: '100%',
                                            height: '24px',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <label style={{ fontSize: '10px', color: 'hsl(var(--color-text-muted))', marginBottom: '2px' }}>Style</label>
                                    <button
                                        title="Italic"
                                        onClick={() => handleChange('fontStyle', (shape.fontStyle === 'italic' ? 'normal' : 'italic'))}
                                        style={{
                                            padding: '0',
                                            background: shape.fontStyle === 'italic' ? 'hsl(var(--color-bg-panel))' : 'hsl(var(--color-bg-app))',
                                            border: '1px solid hsl(var(--color-border))',
                                            borderRadius: '4px',
                                            color: 'hsl(var(--color-text-primary))',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            height: '24px',
                                            width: '100%',
                                            boxSizing: 'border-box'
                                        }}
                                    >
                                        <span style={{ fontStyle: 'italic', fontWeight: 'bold', fontFamily: 'serif' }}>I</span>
                                    </button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <label style={{ fontSize: '10px', color: 'hsl(var(--color-text-muted))', marginBottom: '2px' }}>Align</label>
                                    <div style={{ display: 'flex', border: '1px solid hsl(var(--color-border))', borderRadius: '4px', overflow: 'hidden', height: '24px', boxSizing: 'border-box' }}>
                                        <button
                                            title="Align Left"
                                            onClick={() => handleChange('textAlign', 'left')}
                                            style={{
                                                flex: 1, padding: '0', background: (!shape.textAlign || shape.textAlign === 'left') ? 'hsl(var(--color-bg-panel))' : 'hsl(var(--color-bg-app))',
                                                borderRight: '1px solid hsl(var(--color-border))', color: 'hsl(var(--color-text-primary))', cursor: 'pointer', display: 'flex', justifyContent: 'center',
                                                alignItems: 'center', height: '100%'
                                            }}
                                        >
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="5" width="18" height="2" /><rect x="3" y="11" width="10" height="2" /><rect x="3" y="17" width="14" height="2" /></svg>
                                        </button>
                                        <button
                                            title="Align Center"
                                            onClick={() => handleChange('textAlign', 'center')}
                                            style={{
                                                flex: 1, padding: '0', background: shape.textAlign === 'center' ? 'hsl(var(--color-bg-panel))' : 'hsl(var(--color-bg-app))',
                                                borderRight: '1px solid hsl(var(--color-border))', color: 'hsl(var(--color-text-primary))', cursor: 'pointer', display: 'flex', justifyContent: 'center',
                                                alignItems: 'center', height: '100%'
                                            }}
                                        >
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="5" width="18" height="2" /><rect x="7" y="11" width="10" height="2" /><rect x="5" y="17" width="14" height="2" /></svg>
                                        </button>
                                        <button
                                            title="Align Right"
                                            onClick={() => handleChange('textAlign', 'right')}
                                            style={{
                                                flex: 1, padding: '0', background: shape.textAlign === 'right' ? 'hsl(var(--color-bg-panel))' : 'hsl(var(--color-bg-app))',
                                                color: 'hsl(var(--color-text-primary))', cursor: 'pointer', display: 'flex', justifyContent: 'center',
                                                alignItems: 'center', height: '100%'
                                            }}
                                        >
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="5" width="18" height="2" /><rect x="11" y="11" width="10" height="2" /><rect x="7" y="17" width="14" height="2" /></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {shape.type !== 'line' && shape.type !== 'text' && (
                        <div>
                            <label style={{ fontSize: "var(--text-sm)", color: "hsl(var(--color-text-muted))", display: 'block', marginBottom: '4px' }}>Fill</label>
                            <ColorInput
                                value={shape.fill}
                                onChange={(v) => handleChange('fill', v)}
                                isOpen={activePopup === 'fill'}
                                onToggle={() => setActivePopup(activePopup === 'fill' ? null : 'fill')}
                            />
                        </div>
                    )}



                    {shape.type === 'text' && (
                        <div>
                            <label style={{ fontSize: "var(--text-sm)", color: "hsl(var(--color-text-muted))", display: 'block', marginBottom: '4px' }}>Color</label>
                            <ColorInput
                                value={shape.fill}
                                onChange={(v) => handleChange('fill', v)}
                                isOpen={activePopup === 'fill'}
                                onToggle={() => setActivePopup(activePopup === 'fill' ? null : 'fill')}
                            />
                        </div>
                    )}

                    <div>
                        <label style={{ fontSize: "var(--text-sm)", color: "hsl(var(--color-text-muted))", display: 'block', marginBottom: '4px' }}>Stroke</label>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            <div style={{ flex: 1 }}>
                                <ColorInput
                                    value={shape.stroke || '#000000'}
                                    onChange={(v) => handleChange('stroke', v)}
                                    isOpen={activePopup === 'stroke'}
                                    onToggle={() => setActivePopup(activePopup === 'stroke' ? null : 'stroke')}
                                />
                            </div>
                            <div style={{ width: '60px' }}>
                                <LabelInput label="W" value={shape.strokeWidth || 0} onChange={(v) => handleChange('strokeWidth', Number(v))} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: "var(--text-sm)", color: "hsl(var(--color-text-muted))", display: 'block', marginBottom: '4px' }}>Opacity</label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                                type="range"
                                min="0" max="100"
                                value={Math.round((shape.opacity ?? 1) * 100)}
                                onChange={(e) => handleChange('opacity', Number(e.target.value) / 100)}
                                style={{ flex: 1 }}
                            />
                            <div style={{ width: '52px' }}>
                                <LabelInput label="%" value={Math.round((shape.opacity ?? 1) * 100)} onChange={(v) => handleChange('opacity', Number(v) / 100)} className="no-spin" />
                            </div>
                        </div>
                    </div>

                    {/* Arrange */}
                    <div style={{ marginTop: 'var(--space-2)' }}>
                        <label style={{ fontSize: "var(--text-sm)", color: "hsl(var(--color-text-muted))", display: 'block', marginBottom: '8px' }}>Arrange</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button title="Bring to Front" onClick={() => handleReorder('front')} style={buttonStyle}>Front</button>
                            <button title="Bring Forward" onClick={() => handleReorder('forward')} style={buttonStyle}>Fwd</button>
                            <button title="Send Backward" onClick={() => handleReorder('backward')} style={buttonStyle}>Back</button>
                            <button title="Send to Back" onClick={() => handleReorder('back')} style={buttonStyle}>Btm</button>
                        </div>
                    </div>

                    {shape.type === 'rectangle' && (
                        <div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
                                <LabelInput label="Radius" value={shape.cornerRadius || 0} onChange={(v) => handleChange('cornerRadius', Number(v))} />
                            </div>
                        </div>
                    )}
                </div>



                {/* Template Option */}
                {shape.type === 'artboard' && <TemplateProperties shape={shape} onChange={handleChange} onAddTemplate={addTemplate} buttonStyle={buttonStyle} />}


                {/* Export */}
                <div style={{ borderTop: "1px solid hsl(var(--color-border))", paddingTop: "var(--space-4)", marginTop: "var(--space-4)" }}>
                    <h3 style={{ fontSize: "var(--text-sm)", color: "hsl(var(--color-text-muted))", marginBottom: "var(--space-2)", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Export</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <button onClick={() => exportSelectionToSVG([shape], `${shape.type}-${shape.id.slice(0, 4)}.svg`)} style={buttonStyle}>SVG</button>
                        <button onClick={() => exportSelectionToPNG([shape], `${shape.type}-${shape.id.slice(0, 4)}.png`)} style={buttonStyle}>PNG</button>
                    </div>
                </div>


            </div>
        </div >
    );
}

const buttonStyle = {
    padding: "6px",
    borderRadius: "4px",
    border: "1px solid hsl(var(--color-border))",
    background: "hsl(var(--color-bg-app))",
    color: "hsl(var(--color-text-primary))",
    cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "12px",
    boxSizing: "border-box" as const
};

function LabelInput({ label, value, onChange, className }: { label: string, value: number, onChange: (val: string) => void, className?: string }) {
    return (
        <label style={{ display: 'flex', alignItems: 'center', background: 'hsl(var(--color-bg-app))', border: '1px solid hsl(var(--color-border))', borderRadius: '4px', overflow: 'hidden' }}>
            <span style={{ fontSize: '10px', color: 'hsl(var(--color-text-muted))', padding: '0 4px', borderRight: '1px solid hsl(var(--color-border))', minWidth: '16px', textAlign: 'center' }}>{label}</span>
            <input
                className={className}
                type="number"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{
                    border: 'none', background: 'transparent', width: '100%', padding: '4px',
                    fontSize: '12px', color: 'hsl(var(--color-text-primary))', outline: 'none'
                }}
            />
        </label>
    );
}

const PALETTES = {
    Primary: ['#007B85', '#003841', '#F5F8F6', '#00DEF8'],
    Corporate: ['#87A366', '#91806E', '#E3D9C7', '#BF9E5C', '#683F29', '#DE806B', '#A1B0B8', '#00365C', '#4D1729'],
    Digital: ['#7D55C3', '#FA4505', '#FA8FE3', '#2659E0', '#E3ED00', '#00A64A']
};

function ColorInput({ value, onChange, isOpen, onToggle }: { value: string, onChange: (val: string) => void, isOpen: boolean, onToggle: () => void }) {
    return (
        <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div
                    onClick={onToggle}
                    style={{
                        width: '24px', height: '24px', borderRadius: '50%',
                        backgroundColor: value, border: '1px solid hsl(var(--color-border))',
                        position: 'relative', overflow: 'hidden', flexShrink: 0,
                        cursor: 'pointer'
                    }}
                />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    style={{
                        background: 'hsl(var(--color-bg-app))',
                        border: '1px solid hsl(var(--color-border))',
                        color: 'hsl(var(--color-text-primary))',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '12px',
                        width: '100%',
                        outline: 'none',
                        minWidth: 0
                    }}
                />
            </div>

            {isOpen && (
                <div style={{
                    position: 'absolute', top: '-8px', right: 'calc(100% + 33px)', width: '200px', zIndex: 50,
                    marginTop: '0px', background: 'hsl(var(--color-bg-panel))',
                    border: '1px solid hsl(var(--color-border))', borderRadius: '12px',
                    padding: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    boxSizing: 'border-box'
                }}>
                    {/* Primary */}
                    <div style={{ marginBottom: '8px' }}>
                        <div style={{ fontSize: '10px', color: 'hsl(var(--color-text-muted))', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Primary</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '6px' }}>
                            {PALETTES.Primary.map(c => (
                                <button
                                    key={c}
                                    onClick={() => { onChange(c); onToggle(); }}
                                    style={{
                                        width: '100%', aspectRatio: '1/1', background: c,
                                        border: value === c ? '2px solid white' : '1px solid rgba(0,0,0,0.1)',
                                        borderRadius: '50%', cursor: 'pointer', padding: 0, outline: '1px solid rgba(0,0,0,0.1)',
                                        appearance: 'none', margin: 0
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                    {/* Secondary Corporate */}
                    <div style={{ marginBottom: '8px' }}>
                        <div style={{ fontSize: '10px', color: 'hsl(var(--color-text-muted))', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Corporate</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '6px' }}>
                            {PALETTES.Corporate.map(c => (
                                <button
                                    key={c}
                                    onClick={() => { onChange(c); onToggle(); }}
                                    style={{
                                        width: '100%', aspectRatio: '1/1', background: c,
                                        border: value === c ? '2px solid white' : '1px solid rgba(0,0,0,0.1)',
                                        borderRadius: '50%', cursor: 'pointer', padding: 0, outline: '1px solid rgba(0,0,0,0.1)',
                                        appearance: 'none', margin: 0
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                    {/* Secondary Digital */}
                    <div>
                        <div style={{ fontSize: '10px', color: 'hsl(var(--color-text-muted))', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Digital</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '6px' }}>
                            {PALETTES.Digital.map(c => (
                                <button
                                    key={c}
                                    onClick={() => { onChange(c); onToggle(); }}
                                    style={{
                                        width: '100%', aspectRatio: '1/1', background: c,
                                        border: value === c ? '2px solid white' : '1px solid rgba(0,0,0,0.1)',
                                        borderRadius: '50%', cursor: 'pointer', padding: 0, outline: '1px solid rgba(0,0,0,0.1)',
                                        appearance: 'none', margin: 0
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Custom */}
                    <div style={{ marginTop: '8px', borderTop: '1px solid hsl(var(--color-border))', paddingTop: '8px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}>
                            <div style={{
                                width: '20px', height: '20px', borderRadius: '50%',
                                background: 'conic-gradient(from 0deg, red, yellow, lime, aqua, blue, magenta, red)',
                                border: '1px solid rgba(0,0,0,0.1)'
                            }} />
                            <span style={{ fontSize: '11px', color: 'hsl(var(--color-text-primary))' }}>Custom...</span>
                            <input
                                type="color"
                                value={value}
                                onChange={(e) => onChange(e.target.value)}
                                style={{ position: 'absolute', opacity: 0, width: 0, height: 0, padding: 0, margin: 0, border: 0 }}
                            />
                        </label>
                    </div>
                </div>
            )}
        </div>
    );
}

function SelectInput({ label, value, onChange, options }: { label: string, value: string, onChange: (val: string) => void, options: { value: string, label: string }[] }) {
    return (
        <label style={{ position: 'relative', display: 'flex', alignItems: 'center', background: 'hsl(var(--color-bg-app))', border: '1px solid hsl(var(--color-border))', borderRadius: '4px', overflow: 'hidden' }}>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{
                    border: 'none', background: 'transparent', width: '100%', padding: '6px 8px',
                    fontSize: '12px', color: 'hsl(var(--color-text-primary))', outline: 'none',
                    appearance: 'none', cursor: 'pointer',
                    paddingRight: '24px' // Space for chevron
                }}
            >
                <option value="">{label}</option>
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <div style={{ pointerEvents: 'none', color: 'hsl(var(--color-text-muted))', position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', display: 'flex' }}>
                <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor"><path d="M0 0.5L5 5.5L10 0.5H0Z" /></svg>
            </div>
        </label>
    );
}

import { generatePNGDataURL } from "@/utils/exportUtils";

function TemplateProperties({ shape, onChange, onAddTemplate, buttonStyle }: { shape: any, onChange: any, onAddTemplate: (t: any) => void, buttonStyle: any }) {
    const [isHovered, setIsHovered] = useState(false);
    const isDisabled = !shape.isTemplate && (!shape.templatePlatform || !shape.templateBusiness);
    const isActive = shape.isTemplate;

    const handleAddTemplate = async () => {
        if (isDisabled) return;

        // Toggle state
        const newIsTemplate = !shape.isTemplate;
        onChange('isTemplate', newIsTemplate);

        if (newIsTemplate) {
            // Save as template
            const thumbnail = await generatePNGDataURL([shape]);

            // Deep clone shape for template storage
            const templateShape = JSON.parse(JSON.stringify(shape));

            onAddTemplate({
                id: crypto.randomUUID(),
                name: shape.name || 'Untitled Artboard',
                thumbnail,
                shapes: [templateShape], // Store the artboard itself as the root
                platform: shape.templatePlatform,
                business: shape.templateBusiness,
                width: shape.width,
                height: shape.height
            });
        }
    };

    return (
        <div style={{ borderTop: "1px solid hsl(var(--color-border))", paddingTop: "var(--space-4)", marginTop: "var(--space-4)" }}>
            <h3 style={{ fontSize: "var(--text-sm)", color: "hsl(var(--color-text-muted))", marginBottom: "var(--space-2)", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Template</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <SelectInput
                        label="Platform"
                        value={shape.templatePlatform || ''}
                        onChange={(v) => onChange('templatePlatform', v)}
                        options={[
                            { value: 'LinkedIn', label: 'LinkedIn' },
                            { value: 'Instagram', label: 'Instagram' },
                            { value: 'Facebook', label: 'Facebook' },
                            { value: 'TikTok', label: 'TikTok' },
                            { value: 'YouTube', label: 'YouTube' }
                        ]}
                    />
                    <SelectInput
                        label="Business"
                        value={shape.templateBusiness || ''}
                        onChange={(v) => onChange('templateBusiness', v)}
                        options={[
                            { value: 'Corporate', label: 'Corporate' },
                            { value: 'Digital', label: 'Digital' },
                            { value: 'NBG Pay', label: 'NBG Pay' },
                            { value: 'Next', label: 'Next' }
                        ]}
                    />
                </div>

                <button
                    onClick={handleAddTemplate}
                    disabled={isDisabled}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    style={{
                        ...buttonStyle,
                        width: '100%',
                        backgroundColor: (isActive || (isHovered && !isDisabled)) ? 'hsl(var(--color-accent))' : 'hsl(var(--color-bg-app))',
                        color: (isActive || (isHovered && !isDisabled)) ? 'white' : 'hsl(var(--color-text-primary))',
                        borderColor: (isActive || (isHovered && !isDisabled)) ? 'hsl(var(--color-accent))' : 'hsl(var(--color-border))',
                        opacity: isDisabled ? 0.5 : 1,
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                >
                    Add as Template
                </button>
            </div>
        </div>
    );
}
