const fs = require('fs');
const path = require('path');

const svgsDir = path.join(__dirname, 'src', 'assets', 'svgs');

function capitalize(str) {
    return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function generate() {
    const categories = fs.readdirSync(svgsDir).filter(f => fs.statSync(path.join(svgsDir, f)).isDirectory());
    
    const assetLibrary = {};

    categories.forEach(categoryFolder => {
        const themesDir = path.join(svgsDir, categoryFolder);
        const themes = fs.readdirSync(themesDir).filter(f => fs.statSync(path.join(themesDir, f)).isDirectory());

        themes.forEach(theme => {
            const finalCategoryName = categoryFolder === 'ellipses' ? capitalize(theme) : capitalize(categoryFolder);
            if (!assetLibrary[finalCategoryName]) {
                assetLibrary[finalCategoryName] = [];
            }

            const filesDir = path.join(themesDir, theme);
            const files = fs.readdirSync(filesDir).filter(f => f.endsWith('.svg'));

            files.forEach(file => {
                const content = fs.readFileSync(path.join(filesDir, file), 'utf-8').trim();
                
                let name = file.replace('.svg', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                
                let lang = 'EN';
                const langMatch = file.match(/_(en|gr)\.svg$/i);
                if (langMatch) {
                    lang = langMatch[1].toUpperCase();
                    name = name.replace(new RegExp(` (En|Gr)$`, 'i'), '');
                } else if (file === 'nbg_logo_stacked_light_.svg') {
                    // special case for a typo in the filename
                    lang = 'GR'; // Just guessing or default
                }
                
                assetLibrary[finalCategoryName].push({
                    id: `${categoryFolder}_${theme}_${file}`,
                    name: name,
                    lang: lang,
                    content: content
                });
            });
        });
    });

    const outPath = path.join(__dirname, 'src', 'data', 'assets.ts');
    const outContent = `export const ASSET_LIBRARY: Record<string, { id: string; name: string; lang: string; content: string }[]> = ${JSON.stringify(assetLibrary, null, 2)};\n`;
    fs.writeFileSync(outPath, outContent);
    console.log('Successfully generated assets.ts');
}

generate();
