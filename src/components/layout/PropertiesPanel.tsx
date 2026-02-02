'use client';
import React, { useState } from 'react';

import { useCanvasStore } from "@/store/canvasStore";
import { exportSelectionToSVG, exportSelectionToPNG } from "@/utils/exportUtils";
import { findShape } from "@/utils/shapeUtils";

export function PropertiesPanel() {
    const { selectedIds, shapes, updateShape, reorderShape, saveSnapshot, alignShapes, distributeShapes } = useCanvasStore();

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

    const handleChange = (key: keyof typeof shape, value: string | number) => {
        saveSnapshot(); // Save before update
        updateShape(primaryId, { [key]: value });
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
                {shape.type === 'line' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
                        <LabelInput label="X1" value={Math.round(shape.x)} onChange={(v) => handleChange('x', Number(v))} />
                        <LabelInput label="Y1" value={Math.round(shape.y)} onChange={(v) => handleChange('y', Number(v))} />
                        <LabelInput label="X2" value={Math.round(shape.x2 ?? shape.x)} onChange={(v) => handleChange('x2', Number(v))} />
                        <LabelInput label="Y2" value={Math.round(shape.y2 ?? shape.y)} onChange={(v) => handleChange('y2', Number(v))} />
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
                        <LabelInput label="X" value={Math.round(shape.x)} onChange={(v) => handleChange('x', Number(v))} />
                        <LabelInput label="Y" value={Math.round(shape.y)} onChange={(v) => handleChange('y', Number(v))} />
                        <LabelInput label="W" value={Math.round(shape.width)} onChange={(v) => handleChange('width', Number(v))} />
                        <LabelInput label="H" value={Math.round(shape.height)} onChange={(v) => handleChange('height', Number(v))} />
                        <LabelInput label="R" value={Math.round(shape.rotation || 0)} onChange={(v) => handleChange('rotation', Number(v))} />
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
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
                                <LabelInput label="Size" value={shape.fontSize || 16} onChange={(v) => handleChange('fontSize', Number(v))} />
                            </div>
                        </div>
                    )}

                    {shape.type !== 'line' && shape.type !== 'text' && (
                        <div>
                            <label style={{ fontSize: "var(--text-sm)", color: "hsl(var(--color-text-muted))", display: 'block', marginBottom: '4px' }}>Fill</label>
                            <ColorInput value={shape.fill} onChange={(v) => handleChange('fill', v)} />
                        </div>
                    )}

                    {shape.type === 'text' && (
                        <div>
                            <label style={{ fontSize: "var(--text-sm)", color: "hsl(var(--color-text-muted))", display: 'block', marginBottom: '4px' }}>Color</label>
                            <ColorInput value={shape.fill} onChange={(v) => handleChange('fill', v)} />
                        </div>
                    )}

                    <div>
                        <label style={{ fontSize: "var(--text-sm)", color: "hsl(var(--color-text-muted))", display: 'block', marginBottom: '4px' }}>Stroke</label>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            <div style={{ flex: 1 }}>
                                <ColorInput value={shape.stroke || '#000000'} onChange={(v) => handleChange('stroke', v)} />
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
                            <div style={{ width: '40px' }}>
                                <LabelInput label="%" value={Math.round((shape.opacity ?? 1) * 100)} onChange={(v) => handleChange('opacity', Number(v) / 100)} />
                            </div>
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

                {/* Export */}
                <div style={{ borderTop: "1px solid hsl(var(--color-border))", paddingTop: "var(--space-4)", marginTop: "var(--space-4)" }}>
                    <h3 style={{ fontSize: "var(--text-sm)", color: "hsl(var(--color-text-muted))", marginBottom: "var(--space-2)", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Export</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <button onClick={() => exportSelectionToSVG([shape], `${shape.type}-${shape.id.slice(0, 4)}.svg`)} style={buttonStyle}>SVG</button>
                        <button onClick={() => exportSelectionToPNG([shape], `${shape.type}-${shape.id.slice(0, 4)}.png`)} style={buttonStyle}>PNG</button>
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
            </div>
        </div>
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
    fontSize: "12px"
};

function LabelInput({ label, value, onChange }: { label: string, value: number, onChange: (val: string) => void }) {
    return (
        <label style={{ display: 'flex', alignItems: 'center', background: 'hsl(var(--color-bg-app))', border: '1px solid hsl(var(--color-border))', borderRadius: '4px', overflow: 'hidden' }}>
            <span style={{ fontSize: '10px', color: 'hsl(var(--color-text-muted))', padding: '0 4px', borderRight: '1px solid hsl(var(--color-border))', minWidth: '16px', textAlign: 'center' }}>{label}</span>
            <input
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

function ColorInput({ value, onChange }: { value: string, onChange: (val: string) => void }) {
    const [showPalette, setShowPalette] = React.useState(false);

    return (
        <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div
                    onClick={() => setShowPalette(!showPalette)}
                    style={{
                        width: '24px', height: '24px', borderRadius: '4px',
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

            {showPalette && (
                <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                    marginTop: '4px', background: 'hsl(var(--color-bg-panel))',
                    border: '1px solid hsl(var(--color-border))', borderRadius: '4px',
                    padding: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}>
                    {/* Primary */}
                    <div style={{ marginBottom: '8px' }}>
                        <div style={{ fontSize: '10px', color: 'hsl(var(--color-text-muted))', marginBottom: '4px', textTransform: 'uppercase' }}>Primary</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
                            {PALETTES.Primary.map(c => (
                                <button
                                    key={c}
                                    onClick={() => { onChange(c); setShowPalette(false); }}
                                    style={{
                                        width: '100%', aspectRatio: '1/1', background: c,
                                        border: value === c ? '2px solid white' : '1px solid rgba(0,0,0,0.1)',
                                        borderRadius: '2px', cursor: 'pointer', padding: 0, outline: '1px solid rgba(0,0,0,0.1)'
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                    {/* Secondary Corporate */}
                    <div style={{ marginBottom: '8px' }}>
                        <div style={{ fontSize: '10px', color: 'hsl(var(--color-text-muted))', marginBottom: '4px', textTransform: 'uppercase' }}>Corporate</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
                            {PALETTES.Corporate.map(c => (
                                <button
                                    key={c}
                                    onClick={() => { onChange(c); setShowPalette(false); }}
                                    style={{
                                        width: '100%', aspectRatio: '1/1', background: c,
                                        border: value === c ? '2px solid white' : '1px solid rgba(0,0,0,0.1)',
                                        borderRadius: '2px', cursor: 'pointer', padding: 0, outline: '1px solid rgba(0,0,0,0.1)'
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                    {/* Secondary Digital */}
                    <div>
                        <div style={{ fontSize: '10px', color: 'hsl(var(--color-text-muted))', marginBottom: '4px', textTransform: 'uppercase' }}>Digital</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
                            {PALETTES.Digital.map(c => (
                                <button
                                    key={c}
                                    onClick={() => { onChange(c); setShowPalette(false); }}
                                    style={{
                                        width: '100%', aspectRatio: '1/1', background: c,
                                        border: value === c ? '2px solid white' : '1px solid rgba(0,0,0,0.1)',
                                        borderRadius: '2px', cursor: 'pointer', padding: 0, outline: '1px solid rgba(0,0,0,0.1)'
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Custom */}
                    <div style={{ marginTop: '8px', borderTop: '1px solid hsl(var(--color-border))', paddingTop: '8px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}>
                            <div style={{
                                width: '16px', height: '16px', borderRadius: '50%',
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
