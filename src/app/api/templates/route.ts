import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const TEMPLATES_FILE = path.join(process.cwd(), 'src', 'data', 'templates.json');

export async function GET() {
    try {
        const raw = fs.readFileSync(TEMPLATES_FILE, 'utf-8');
        const templates = JSON.parse(raw);
        return NextResponse.json(templates);
    } catch {
        return NextResponse.json([]);
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // body can be a single template (append) or an array (replace all)
        const raw = fs.readFileSync(TEMPLATES_FILE, 'utf-8');
        const existing = JSON.parse(raw) as any[];

        const updated = Array.isArray(body) ? body : [...existing, body];
        fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(updated, null, 2), 'utf-8');

        return NextResponse.json({ success: true, count: updated.length });
    } catch (err) {
        return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
    }
}
