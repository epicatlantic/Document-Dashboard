const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();

// Ensure the 'docs' folder exists so the server doesn't crash
const uploadDir = './docs';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

app.use(express.static('./')); 
app.use('/docs', express.static('./docs')); // Allows the browser to actually view the files
app.use(express.json());

// NEW ROUTE: This reads the folder and sends the list to your Admin Page
app.get('/list-files', (req, res) => {
    fs.readdir(uploadDir, (err, files) => {
        if (err) return res.status(500).send("Unable to scan files");
        
        // Transform the filenames into the format your frontend expects
        const fileList = files.map(file => ({
            name: file,
            type: file.split('.').pop().toLowerCase(),
            size: (fs.statSync(path.join(uploadDir, file)).size / 1024).toFixed(1) + " KB"
        }));
        res.json({ items: fileList });
    });
});

app.post('/upload', upload.single('file'), (req, res) => {
    res.send({ message: "File uploaded successfully!" });
});

app.delete('/delete/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'docs', req.params.filename);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.send({ message: "File deleted!" });
    } else {
        res.status(404).send("File not found");
    }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));