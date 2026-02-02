import { Shape } from "@/store/canvasStore";

// Helper to escape HTML characters
const escapeHTML = (str: string) => str.replace(/[&<>'"]/g,
    tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[tag] || tag)
);

// Calculate bounding box for a list of shapes
const getBounds = (shapes: Shape[]) => {
    if (shapes.length === 0) return { x: 0, y: 0, width: 800, height: 600 };

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    shapes.forEach(shape => {
        // Basic AABB. For rotated shapes, this might be slightly off but acceptable for MVP.
        const x = shape.x;
        const y = shape.y;
        const w = shape.width;
        const h = shape.height;

        // If it's a line
        if (shape.type === 'line') {
            minX = Math.min(minX, x, shape.x2 ?? x);
            minY = Math.min(minY, y, shape.y2 ?? y);
            maxX = Math.max(maxX, x, shape.x2 ?? x);
            maxY = Math.max(maxY, y, shape.y2 ?? y);
        } else {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x + w);
            maxY = Math.max(maxY, y + h);
        }
    });

    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
};

// Generate SVG string for a single shape
const generateShapeSVG = (shape: Shape): string => {
    if (shape.visible === false) return '';

    const commonAttrs = `id="${shape.id}" opacity="${shape.opacity ?? 1}"`;
    const transform = shape.rotation ? `transform="rotate(${shape.rotation}, ${shape.x + shape.width / 2}, ${shape.y + shape.height / 2})"` : '';

    // Fill/Stroke logic
    const fill = shape.fill === 'transparent' ? 'none' : shape.fill;
    const stroke = shape.stroke || 'none';
    const strokeWidth = shape.strokeWidth || 0;

    switch (shape.type) {
        case 'rectangle':
            return `<rect x="${shape.x}" y="${shape.y}" width="${shape.width}" height="${shape.height}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" rx="${shape.cornerRadius || 0}" ry="${shape.cornerRadius || 0}" ${commonAttrs} ${transform} />`;

        case 'ellipse':
            return `<ellipse cx="${shape.x + shape.width / 2}" cy="${shape.y + shape.height / 2}" rx="${Math.abs(shape.width / 2)}" ry="${Math.abs(shape.height / 2)}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" ${commonAttrs} ${transform} />`;

        case 'line':
            return `<line x1="${shape.x}" y1="${shape.y}" x2="${shape.x2 ?? shape.x}" y2="${shape.y2 ?? shape.y}" stroke="${stroke}" stroke-width="${strokeWidth || 1}" ${commonAttrs} />`;

        case 'text':
            return `<text x="${shape.x}" y="${shape.y + (shape.fontSize || 16)}" fill="${fill}" font-family="${shape.fontFamily || 'sans-serif'}" font-size="${shape.fontSize || 16}" ${commonAttrs} ${transform} style="white-space: pre;">${escapeHTML(shape.textContent || '')}</text>`;

        case 'group':
            const childrenSVG = shape.children?.map(child => generateShapeSVG(child)).join('\n') || '';
            return `<g transform="translate(${shape.x}, ${shape.y})" ${commonAttrs} ${transform}>
                        ${childrenSVG}
                    </g>`;

        case 'artboard':
            // Clip path definition
            const clipId = `clip-${shape.id}`;
            const clipPath = `<defs><clipPath id="${clipId}"><rect x="0" y="0" width="${shape.width}" height="${shape.height}" /></clipPath></defs>`;

            // Background
            const bg = `<rect x="${shape.x}" y="${shape.y}" width="${shape.width}" height="${shape.height}" fill="${fill}" ${commonAttrs} />`;

            // Children (clipped and translated)
            const artboardChildren = shape.children?.map(child => generateShapeSVG(child)).join('\n') || '';
            const clippedGroup = `<g transform="translate(${shape.x}, ${shape.y})" clip-path="url(#${clipId})">
                                    ${artboardChildren}
                                  </g>`;

            return `
                ${clipPath}
                ${bg}
                ${clippedGroup}
            `;

        default:
            return '';
    }
};

export const generateSVGString = (shapes: Shape[], bounds?: { x: number, y: number, width: number, height: number }): string => {
    const finalBounds = bounds || getBounds(shapes);
    const content = shapes.map(s => generateShapeSVG(s)).join('\n');

    // Add some padding to bounds
    const padding = 20;
    const viewBox = `${finalBounds.x - padding} ${finalBounds.y - padding} ${finalBounds.width + padding * 2} ${finalBounds.height + padding * 2}`;

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${finalBounds.width + padding * 2}" height="${finalBounds.height + padding * 2}">
        ${content}
    </svg>`;
};

export const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const exportSelectionToSVG = (shapes: Shape[], filename: string = 'export.svg') => {
    const svgString = generateSVGString(shapes);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    downloadBlob(blob, filename);
};

export const exportSelectionToPNG = (shapes: Shape[], filename: string = 'export.png') => {
    const svgString = generateSVGString(shapes);
    const img = new Image();
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((pngBlob) => {
                if (pngBlob) {
                    downloadBlob(pngBlob, filename);
                }
                URL.revokeObjectURL(url);
            });
        }
    };
    img.src = url;
};
