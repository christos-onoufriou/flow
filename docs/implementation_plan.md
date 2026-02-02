# Implementation Plan: Layer Management Improvements

## Goal Description
1.  **Fix "Arrange" Buttons**: Ensure "Send to Back", "Bring to Front", etc., work for items nested inside Artboards or Groups.
2.  **Layers Panel DnD**: Allow users to reorder layers by dragging and dropping them within the Layers Panel.

## Proposed Changes

### [MODIFY] [canvasStore.ts](file:///Users/christos.onoufriou/.gemini/antigravity/scratch/flow/src/store/canvasStore.ts)
-   **Refactor `reorderShape`**: Update to locate the parent array (root `shapes` or a child's `children`) containing the target ID and apply the reorder logic there.
-   **Add `moveLayer` Action**: (Optional, might be needed for DnD) `moveLayer(dragId: string, hoverId: string, position: 'above' | 'below' | 'inside')`. 
    -   Moving "above/below" implies reordering within the same parent (or reparenting if moving between scopes).
    -   For MVP "dragging up and down", we primarily need reordering.

### [MODIFY] [LayersPanel.tsx](file:///Users/christos.onoufriou/.gemini/antigravity/scratch/flow/src/components/layout/LayersPanel.tsx)
-   **Add Drag Attributes**: Make layer items `draggable`.
-   **Handle Drag Events**: `onDragStart`, `onDragOver`, `onDrop`.
-   **Visual Feedback**: Highlight drop targets (border, line).
-   **Logic**:
    -   On Drop, call `moveLayer` (or reuse `reorderShape` if just simple Up/Down, but DnD is usually absolute "move to index X").
    -   Actually, `reorderShape` (Front/Back/Forward/Backward) is relative. DnD is absolute "Place A before B".
    -   So I definitively need a new `moveLayer` action.

## Verification Plan

### Automated
-   None (Store logic is hard to unit test here without setup).

### Manual
1.  **Arrange Buttons**:
    -   Create Artboard.
    -   Add 2 Rects inside.
    -   Select top one, click "Send to Back".
    -   Verify visual order updates AND Layers panel order updates.
2.  **Layers Panel Drag**:
    -   Drag "Layer 1" below "Layer 2".
    -   Verify order swaps.
    -   (Bonus) Drag Root item into Artboard? (Might be complex, focus on reordering first).
