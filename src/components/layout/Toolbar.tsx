'use client';

import { useCanvasStore } from "@/store/canvasStore";

export function Toolbar() {
    const { activeTool, setActiveTool, undo, redo, past, future } = useCanvasStore();

    const getButtonStyle = (tool: string) => ({
        padding: "4px 8px",
        borderRadius: "var(--radius-sm)",
        backgroundColor: activeTool === tool ? "hsl(var(--color-accent))" : "transparent",
        color: activeTool === tool ? "hsl(var(--color-accent-fg))" : "inherit",
        fontSize: "var(--text-sm)",
        border: "1px solid transparent",
    });

    return (
        <div style={{ display: "flex", gap: "16px", alignItems: "center", fontWeight: 500 }}>
            <span style={{ marginRight: "16px", fontSize: "1.1rem" }}>Flow</span>
            <div style={{ width: "1px", height: "24px", background: "hsl(var(--color-border))" }}></div>

            <button style={getButtonStyle('select')} onClick={() => setActiveTool('select')}>Select</button>
            <button style={getButtonStyle('rectangle')} onClick={() => setActiveTool('rectangle')}>Rectangle</button>
            <button style={getButtonStyle('ellipse')} onClick={() => setActiveTool('ellipse')}>Ellipse</button>
            <button style={getButtonStyle('line')} onClick={() => setActiveTool('line')}>Line</button>
            <button style={getButtonStyle('text')} onClick={() => setActiveTool('text')}>Text</button>
            <button style={getButtonStyle('artboard')} onClick={() => setActiveTool('artboard')}>Artboard</button>

            <div style={{ width: "1px", height: "24px", background: "hsl(var(--color-border))", margin: "0 8px" }}></div>
            <button onClick={undo} disabled={past.length === 0} style={{ ...getButtonStyle(''), opacity: past.length === 0 ? 0.5 : 1, cursor: past.length === 0 ? 'default' : 'pointer' }}>Undo</button>
            <button onClick={redo} disabled={future.length === 0} style={{ ...getButtonStyle(''), opacity: future.length === 0 ? 0.5 : 1, cursor: future.length === 0 ? 'default' : 'pointer' }}>Redo</button>
        </div>
    );
}
