import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const PROJECTS_DIR = path.join(process.cwd(), 'src', 'projects');

function ensureDir() {
    if (!fs.existsSync(PROJECTS_DIR)) fs.mkdirSync(PROJECTS_DIR, { recursive: true });
}

// GET /api/projects — list all saved projects
export async function GET() {
    try {
        ensureDir();
        const files = fs.readdirSync(PROJECTS_DIR)
            .filter(f => f.endsWith('.flow'));

        const projects = files.map(file => {
            const filePath = path.join(PROJECTS_DIR, file);
            const stat = fs.statSync(filePath);
            try {
                const raw = fs.readFileSync(filePath, 'utf-8');
                const data = JSON.parse(raw);
                return {
                    filename: file,
                    name: data.name || file.replace('.flow', ''),
                    savedAt: data.savedAt || stat.mtime.toISOString(),
                    shapeCount: data.shapes?.length ?? 0,
                };
            } catch {
                return {
                    filename: file,
                    name: file.replace('.flow', ''),
                    savedAt: stat.mtime.toISOString(),
                    shapeCount: 0,
                };
            }
        });

        // Sort by most recently saved
        projects.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());

        return NextResponse.json(projects);
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}

// POST /api/projects — save a project file
export async function POST(request: Request) {
    try {
        ensureDir();
        const body = await request.json();
        const { filename, ...data } = body;

        if (!filename) {
            return NextResponse.json({ error: 'filename is required' }, { status: 400 });
        }

        // Sanitise filename
        const safe = filename.replace(/[^a-zA-Z0-9_\- ]/g, '_').trim();
        const filePath = path.join(PROJECTS_DIR, `${safe}.flow`);

        fs.writeFileSync(filePath, JSON.stringify({ ...data, savedAt: new Date().toISOString() }, null, 2), 'utf-8');

        return NextResponse.json({ success: true, filename: `${safe}.flow` });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
