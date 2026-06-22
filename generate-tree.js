const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(__dirname, 'docs');
const OUTPUT_TXT = path.join(__dirname, 'project-index.txt');

/**
 * Recursively generates a text-based tree structure
 */
function generateTreeText(dirPath, prefix = '') {
    let output = '';
    const items = fs.readdirSync(dirPath).filter(item => !item.startsWith('.'));
    
    // Sort items: folders first, then files
    items.sort((a, b) => {
        const aStat = fs.statSync(path.join(dirPath, a));
        const bStat = fs.statSync(path.join(dirPath, b));
        if (aStat.isDirectory() !== bStat.isDirectory()) {
            return aStat.isDirectory() ? -1 : 1;
        }
        return a.localeCompare(b);
    });

    items.forEach((item, index) => {
        const isLast = index === items.length - 1;
        const itemPath = path.join(dirPath, item);
        const isDirectory = fs.statSync(itemPath).isDirectory();
        
        // Use standard tree branch characters
        const connector = isLast ? '└── ' : '├── ';
        output += `${prefix}${connector}${item}\n`;

        if (isDirectory) {
            // Adjust the spacing indentation for deeper levels
            const newPrefix = prefix + (isLast ? '    ' : '│   ');
            output += generateTreeText(itemPath, newPrefix);
        }
    });

    return output;
}

try {
    console.log('📝 Generating text index tree...');
    
    if (!fs.existsSync(DOCS_DIR)) {
        console.error('❌ Error: "docs" folder not found.');
        process.exit(1);
    }

    // Start building the file visual structure
    let treeContent = `DOCUMENT REPOSITORY INDEX\n`;
    treeContent += `Generated on: ${new Date().toLocaleDateString()}\n`;
    treeContent += `=========================================\n\n`;
    treeContent += `docs/\n`;
    treeContent += generateTreeText(DOCS_DIR);

    // Save out to a text document
    fs.writeFileSync(OUTPUT_TXT, treeContent, 'utf8');
    console.log('✅ Success! "project-index.txt" has been created.');
} catch (error) {
    console.error('❌ Failed to build tree text:', error.message);
}