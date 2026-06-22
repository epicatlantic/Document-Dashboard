const fs = require('fs');
const path = require('path');

const targetDir = './docs'; 

function scanFolder(dirPath, relativePath = 'docs') {
    const stats = fs.statSync(dirPath);
    const itemName = path.basename(dirPath);
    const item = {
        name: itemName,
    };

    if (stats.isDirectory()) {
        item.type = 'folder';
        const children = fs.readdirSync(dirPath);

        // --- AUTOMATIC PREVIEW LOOKUP ---
        // We check for an image that matches the folder name
        const possibleImages = [`${itemName}.png`, `${itemName}.jpg`, `${itemName}.PNG`, `${itemName}.JPG`];
        const previewFile = children.find(child => possibleImages.includes(child));
        
        if (previewFile) {
            // This creates a path like "docs/BFPCL/BFPCL.png"
            // so your HTML can find it from the root.
            item.preview = path.join(relativePath, previewFile).replace(/\\/g, '/');
        }

        // Pass the new relative path down to children
        item.items = children.map(child => 
            scanFolder(path.join(dirPath, child), path.join(relativePath, child))
        );
    } else {
        item.type = path.extname(dirPath).substring(1).toLowerCase();
        const sizeInBytes = stats.size;
        item.size = sizeInBytes > 1024 * 1024 
            ? (sizeInBytes / (1024 * 1024)).toFixed(1) + ' MB'
            : (sizeInBytes / 1024).toFixed(1) + ' KB';
        
        // Also add preview path to files if they are images
        if (['png', 'jpg', 'jpeg'].includes(item.type)) {
            item.preview = relativePath.replace(/\\/g, '/');
        }
    }

    return item;
}

try {
    const tree = scanFolder(targetDir);
    fs.writeFileSync('data.json', JSON.stringify(tree, null, 2));
    console.log('✅ Success! data.json updated with relative paths for GitHub.');
} catch (error) {
    console.error('❌ Error:', error);
}