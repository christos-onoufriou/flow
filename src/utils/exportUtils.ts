import { Shape, useCanvasStore } from "@/store/canvasStore";

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

// Generate complete SVG markup for a single shape (all types handled)
const generateShapeSVG = (shape: Shape, offsetX = 0, offsetY = 0): string => {
    if (shape.visible === false) return '';

    const ox = offsetX;
    const oy = offsetY;
    const x = shape.x + ox;
    const y = shape.y + oy;
    const w = shape.width;
    const h = shape.height;
    const opacity = shape.opacity ?? 1;
    const fill = (!shape.fill || shape.fill === 'transparent') ? 'none' : shape.fill;
    const stroke = shape.stroke || 'none';
    const sw = shape.strokeWidth || 0;
    const rotation = shape.rotation || 0;
    const cx = x + w / 2;
    const cy = y + h / 2;
    const rotAttr = rotation ? ` transform="rotate(${rotation} ${cx} ${cy})"` : '';
    const opacityAttr = opacity !== 1 ? ` opacity="${opacity}"` : '';

    switch (shape.type) {
        case 'rectangle':
            return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" rx="${shape.cornerRadius || 0}" ry="${shape.cornerRadius || 0}"${rotAttr}${opacityAttr}/>`;

        case 'ellipse':
            return `<ellipse cx="${x + w / 2}" cy="${y + h / 2}" rx="${Math.abs(w / 2)}" ry="${Math.abs(h / 2)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${rotAttr}${opacityAttr}/>`;

        case 'line':
            return `<line x1="${x}" y1="${y}" x2="${(shape.x2 ?? shape.x) + ox}" y2="${(shape.y2 ?? shape.y) + oy}" stroke="${stroke || fill}" stroke-width="${sw || 2}" stroke-linecap="round"${opacityAttr}/>`;

        case 'text': {
            const fontSize = shape.fontSize || 16;
            
            // Map CSS variables to valid font strings because 'var()' is invalid in SVG font-family attributes
            let fontFamily = shape.fontFamily || 'sans-serif';
            if (fontFamily.includes('var(--font-aeonik-pro)')) fontFamily = "'Aeonik Pro', -apple-system, sans-serif";
            else if (fontFamily.includes('var(--font-roboto)')) fontFamily = "'Roboto', sans-serif";
            else if (fontFamily.includes('var(--font-open-sans)')) fontFamily = "'Open Sans', sans-serif";
            else if (fontFamily.includes('var(--font-lato)')) fontFamily = "'Lato', sans-serif";

            const fontWeight = shape.fontWeight || '400';
            const fontStyle = shape.fontStyle || 'normal';
            const textAlign = shape.textAlign || 'left';
            const lineHeight = shape.lineHeight || 1.2;
            const letterSpacing = shape.letterSpacing || 0;
            const rawLines = (shape.textContent || 'Text').split('\n');
            const alignAttr = textAlign === 'center' ? 'middle' : textAlign === 'right' ? 'end' : 'start';
            const textX = textAlign === 'center' ? x + w / 2 : textAlign === 'right' ? x + w : x;
            
            const strokeAttr = sw > 0 ? ` stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" paint-order="stroke fill"` : '';
            
            // Bounding box word-wrapping via exact canvas measurement
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Initialize canvas font context to match the shape perfectly
                ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
            }

            const wrappedLines: string[] = [];

            rawLines.forEach(line => {
                if (!ctx) {
                    wrappedLines.push(line);
                    return;
                }
                const words = line.split(' ');
                let currentLine = '';
                words.forEach(word => {
                    const testLine = currentLine + (currentLine ? ' ' : '') + word;
                    // measureText gives pixel width; add manual letter-spacing pixels
                    const lsPixels = letterSpacing * fontSize;
                    const testWidth = ctx.measureText(testLine).width + (testLine.length * lsPixels);
                    
                    if (testWidth > w && currentLine.length > 0) {
                        wrappedLines.push(currentLine);
                        currentLine = word;
                    } else {
                        currentLine = testLine;
                    }
                });
                wrappedLines.push(currentLine);
            });

            const tspans = wrappedLines.map((line, i) =>
                `<tspan x="${textX}" dy="${i === 0 ? 0 : lineHeight * fontSize}">${escapeHTML(line)}</tspan>`
            ).join('');
            
            return `<text x="${textX}" y="${y + fontSize * 0.9}" fill="${fill}" font-family="${fontFamily}" font-size="${fontSize}" font-weight="${fontWeight}" font-style="${fontStyle}" letter-spacing="${letterSpacing}em" text-anchor="${alignAttr}"${strokeAttr}${rotAttr}${opacityAttr}>${tspans}</text>`;
        }

        case 'image':
            return `<image xlink:href="${escapeHTML(shape.src || '')}" href="${escapeHTML(shape.src || '')}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="none"${rotAttr}${opacityAttr}/>`;

        case 'svg': {
            if (!shape.svgContent) return '';
            // Strip <?xml ... ?> and <!DOCTYPE ...> to prevent invalid nested XML breaking the data URI
            let cleanSvg = shape.svgContent.replace(/<\?xml[^>]*\?>/gi, '').replace(/<!DOCTYPE[^>]*>/gi, '').trim();

            const uniqueClass = `svg-shape-${shape.id.replace(/-/g, '')}`;
            cleanSvg = cleanSvg.replace(/<svg([^>]*)>/i, (match, p1) => {
                const attrs = p1
                    .replace(/\bwidth=(['"])[^'"]*\1/gi, '')
                    .replace(/\bheight=(['"])[^'"]*\1/gi, '')
                    .replace(/\bpreserveAspectRatio=(['"])[^'"]*\1/gi, '');
                return `<svg${attrs} width="${w}" height="${h}" preserveAspectRatio="none" class="${uniqueClass}">`;
            });

            if (shape.colorEditable) {
                let styles = '';
                if (shape.fill && shape.fill !== 'transparent') {
                    styles += `.${uniqueClass} path, .${uniqueClass} rect, .${uniqueClass} circle, .${uniqueClass} ellipse, .${uniqueClass} polygon, .${uniqueClass} polyline { fill: ${shape.fill} !important; }\n`;
                }
                if (shape.stroke && shape.strokeWidth && shape.strokeWidth > 0) {
                    styles += `.${uniqueClass} path, .${uniqueClass} rect, .${uniqueClass} circle, .${uniqueClass} ellipse, .${uniqueClass} polygon, .${uniqueClass} polyline { stroke: ${shape.stroke} !important; stroke-width: ${shape.strokeWidth}px !important; }\n`;
                }
                if (styles) {
                    cleanSvg = cleanSvg.replace(/<svg([^>]*)>/i, `<svg$1><style>${styles}</style>`);
                }
            }

            // Embed SVG inline inside a group positioned at (x, y)
            return `<g transform="translate(${x}, ${y})"${opacityAttr}>${cleanSvg}</g>`;
        }

        case 'group': {
            const children = generateShapeListSVG(shape.children || [], ox, oy);
            return `<g${rotAttr}${opacityAttr}>${children}</g>`;
        }

        case 'artboard': {
            const clipId = `clip-${shape.id}`;
            // Children are stored with coordinates relative to artboard origin (0,0)
            const children = generateShapeListSVG(shape.children || [], x, y);
            return `
<clipPath id="${clipId}">
  <rect x="${x}" y="${y}" width="${w}" height="${h}"/>
</clipPath>
<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${opacityAttr}/>
<g clip-path="url(#${clipId})">${children}
</g>`;
        }

        default:
            return '';
    }
};

const generateShapeListSVG = (shapes: Shape[], ox = 0, oy = 0): string => {
    const elements: string[] = [];
    let i = 0;
    while (i < shapes.length) {
        const shape = shapes[i];
        const nextShape = i + 1 < shapes.length ? shapes[i + 1] : null;

        if (nextShape && nextShape.isMask) {
            const maskId = `mask-clip-${nextShape.id}`;
            const maskShapeSvg = generateShapeSVG(nextShape, ox, oy);
            const maskedShapeSvg = generateShapeSVG(shape, ox, oy);
            
            elements.push(`
<mask id="${maskId}" maskUnits="userSpaceOnUse" x="-999999" y="-999999" width="1999998" height="1999998">
  <g filter="url(#force-white)">
    ${maskShapeSvg}
  </g>
</mask>
<g mask="url(#${maskId})">
  ${maskedShapeSvg}
</g>
            `);
            i += 2;
        } else if (shape.isMask) {
            elements.push(generateShapeSVG(shape, ox, oy));
            i++;
        } else {
            elements.push(generateShapeSVG(shape, ox, oy));
            i++;
        }
    }
    return elements.join('\n');
};

// Build a complete standalone SVG string from a list of shapes
export const generateSVGString = (shapes: Shape[], bounds?: { x: number, y: number, width: number, height: number }): string => {
    const padding = 20;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    if (bounds) {
        minX = bounds.x; minY = bounds.y;
        maxX = bounds.x + bounds.width; maxY = bounds.y + bounds.height;
    } else {
        shapes.forEach(s => {
            if (s.type === 'line') {
                minX = Math.min(minX, s.x, s.x2 ?? s.x);
                minY = Math.min(minY, s.y, s.y2 ?? s.y);
                maxX = Math.max(maxX, s.x, s.x2 ?? s.x);
                maxY = Math.max(maxY, s.y, s.y2 ?? s.y);
            } else {
                minX = Math.min(minX, s.x);
                minY = Math.min(minY, s.y);
                maxX = Math.max(maxX, s.x + s.width);
                maxY = Math.max(maxY, s.y + s.height);
            }
        });
        if (!isFinite(minX)) { minX = 0; minY = 0; maxX = 800; maxY = 600; }
    }

    const vbX = minX - padding;
    const vbY = minY - padding;
    const vbW = (maxX - minX) + padding * 2;
    const vbH = (maxY - minY) + padding * 2;

    const content = generateShapeListSVG(shapes, 0, 0);

    return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${vbX} ${vbY} ${vbW} ${vbH}" width="${vbW}" height="${vbH}">
<defs>
  <filter id="force-white">
    <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0" />
  </filter>
</defs>
${content}
</svg>`;
};

// Build a precise SVG for a single artboard (no padding, exact dimensions)
const generateArtboardSVGString = (artboard: Shape): string => {
    const { x, y, width, height } = artboard;
    const fill = (!artboard.fill || artboard.fill === 'transparent') ? '#ffffff' : artboard.fill;
    const clipId = `clip-${artboard.id}`;

    const children = generateShapeListSVG(artboard.children || [], x, y);

    return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${x} ${y} ${width} ${height}" width="${width}" height="${height}">
<defs>
  <filter id="force-white">
    <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0" />
  </filter>
  <clipPath id="${clipId}">
    <rect x="${x}" y="${y}" width="${width}" height="${height}"/>
  </clipPath>
</defs>
<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}"/>
<g clip-path="url(#${clipId})">
${children}
</g>
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

const fetchAsBase64 = async (url: string): Promise<string> => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        console.error("Failed to fetch image as base64", e);
        return url;
    }
};

const preloadImages = async (shapes: Shape[]): Promise<Shape[]> => {
    const processShape = async (shape: Shape): Promise<Shape> => {
        if (shape.type === 'image' && shape.src && !shape.src.startsWith('data:')) {
            const base64Src = await fetchAsBase64(shape.src);
            return { ...shape, src: base64Src };
        }
        if (shape.children && shape.children.length > 0) {
            const processedChildren = await Promise.all(shape.children.map(processShape));
            return { ...shape, children: processedChildren };
        }
        return shape;
    };
    return Promise.all(shapes.map(processShape));
};

export const exportSelectionToSVG = async (shapes: Shape[], filename: string = 'export.svg') => {
    const preloadedShapes = await preloadImages(shapes);
    const svgString = generateSVGString(preloadedShapes);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    downloadBlob(blob, filename);
};

export const generatePNGDataURL = (shapes: Shape[]): Promise<string> => {
    return new Promise((resolve) => {
        const svgString = generateSVGString(shapes);
        const dataUri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            } else {
                resolve('');
            }
        };
        img.src = dataUri;
    });
};

export const exportSelectionToPNG = async (shapes: Shape[], filename: string = 'export.png') => {
    const preloadedShapes = await preloadImages(shapes);
    generatePNGDataURL(preloadedShapes).then(dataURL => {
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
};

// ---------------------------------------------------------------------------
// Artboard export — builds a clean standalone SVG from shape data.
// Uses a data: URI to avoid the Chrome blob-URL blank-canvas bug.
// ---------------------------------------------------------------------------

const rasteriseArtboard = async (artboard: Shape, mimeType: 'image/png' | 'image/jpeg', filename: string) => {
    const preloadedArtboard = (await preloadImages([artboard]))[0];
    const svgStr = generateArtboardSVGString(preloadedArtboard);
    const dataUri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr);

    const img = new Image();
    img.onload = () => {
        const scale = 2; // 2× for crisp, retina-quality output
        const offscreen = document.createElement('canvas');
        offscreen.width  = artboard.width  * scale;
        offscreen.height = artboard.height * scale;
        const ctx = offscreen.getContext('2d')!;

        // White fill for JPG (no transparency support); artboard fill for PNG
        const bgFill = (!artboard.fill || artboard.fill === 'transparent') ? '#ffffff' : artboard.fill;
        ctx.fillStyle = mimeType === 'image/jpeg' ? '#ffffff' : bgFill;
        ctx.fillRect(0, 0, offscreen.width, offscreen.height);

        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0, artboard.width, artboard.height);

        const out = offscreen.toDataURL(mimeType, mimeType === 'image/jpeg' ? 0.92 : undefined);
        const link = document.createElement('a');
        link.href = out;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    img.onerror = () => {
        alert('Export failed — could not render the artboard SVG.');
    };
    img.src = dataUri;
};

export const exportArtboardToPNG = async (artboard: Shape, filename?: string) => {
    await rasteriseArtboard(artboard, 'image/png', filename || `artboard-${artboard.id.slice(0, 4)}.png`);
};

export const exportArtboardToJPG = async (artboard: Shape, filename?: string) => {
    await rasteriseArtboard(artboard, 'image/jpeg', filename || `artboard-${artboard.id.slice(0, 4)}.jpg`);
};

export const exportArtboardToSVG = async (artboard: Shape, filename?: string) => {
    const preloadedArtboard = (await preloadImages([artboard]))[0];
    const svgStr = generateArtboardSVGString(preloadedArtboard);
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    downloadBlob(blob, filename || `artboard-${artboard.id.slice(0, 4)}.svg`);
};
