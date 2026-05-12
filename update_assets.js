const fs = require('fs');
const path = require('path');

const segmentsDirDark = path.join(__dirname, 'src', 'assets', 'svgs', 'segments', 'dark');
const segmentsDirLight = path.join(__dirname, 'src', 'assets', 'svgs', 'segments', 'light');

function processDir(dir) {
    if (!fs.existsSync(dir)) return [];
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.svg'));
    return files.map(file => {
        const content = fs.readFileSync(path.join(dir, file), 'utf-8').trim();
        let name = file.replace('.svg', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const langMatch = file.match(/_(en|gr)\.svg$/);
        const lang = langMatch ? langMatch[1].toUpperCase() : 'EN';
        if (langMatch) {
             name = name.replace(/ (En|Gr)$/, '');
        }
        return {
            id: 'segment_' + file,
            name: name,
            lang: lang,
            content: content
        };
    });
}

const darkAssets = processDir(segmentsDirDark);
const lightAssets = processDir(segmentsDirLight);
const allSegments = [...darkAssets, ...lightAssets];

const assetsFile = path.join(__dirname, 'src', 'data', 'assets.ts');
let assetsContent = fs.readFileSync(assetsFile, 'utf-8');

const newSection = `,\n  "Segments": ${JSON.stringify(allSegments, null, 4).replace(/\n/g, '\n  ')}\n};`;

assetsContent = assetsContent.replace(/\n};\s*$/, newSection + '\n');
fs.writeFileSync(assetsFile, assetsContent);
console.log(`Added ${allSegments.length} Segments to ASSET_LIBRARY`);
