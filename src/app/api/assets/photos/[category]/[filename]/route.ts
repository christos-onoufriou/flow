import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(request: Request, { params }: { params: Promise<{ category: string, filename: string }> }) {
    const resolvedParams = await params;
    const category = decodeURIComponent(resolvedParams.category);
    const filename = decodeURIComponent(resolvedParams.filename);
    const filePath = path.join(process.cwd(), 'src', 'assets', 'photos', category, filename);
    
    try {
        const file = fs.readFileSync(filePath);
        const ext = path.extname(filename).toLowerCase();
        let mimeType = 'image/jpeg';
        if (ext === '.png') mimeType = 'image/png';
        
        return new NextResponse(file, {
            headers: {
                'Content-Type': mimeType,
                'Cache-Control': 'public, max-age=86400',
            },
        });
    } catch (e) {
        return new NextResponse('File not found', { status: 404 });
    }
}
