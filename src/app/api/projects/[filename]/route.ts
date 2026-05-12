import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const PROJECTS_DIR = path.join(process.cwd(), 'src', 'projects');

// GET /api/projects/[filename] — load a project file
export async function GET(_req: Request, { params }: { params: Promise<{ filename: string }> }) {
    try {
        const { filename } = await params;
        const filePath = path.join(PROJECTS_DIR, filename);
        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }
        const raw = fs.readFileSync(filePath, 'utf-8');
        return NextResponse.json(JSON.parse(raw));
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}

// DELETE /api/projects/[filename] — delete a project file
export async function DELETE(_req: Request, { params }: { params: Promise<{ filename: string }> }) {
    try {
        const { filename } = await params;
        const filePath = path.join(PROJECTS_DIR, filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
