import { Shape } from "@/store/canvasStore";

// Recursively find a shape by ID
export const findShape = (shapes: Shape[], id: string): Shape | undefined => {
    for (const shape of shapes) {
        if (shape.id === id) {
            return shape;
        }
        if (shape.children) {
            const found = findShape(shape.children, id);
            if (found) return found;
        }
    }
    return undefined;
};
