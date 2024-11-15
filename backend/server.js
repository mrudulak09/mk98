const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth'); // Adjust path as necessary
const cors = require('cors'); // Handle cross-origin requests
require('dotenv').config(); // Load environment variables
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/notesbuzz';

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use('/auth', authRoutes); // Route for authentication

// Connect to MongoDB
const conn = mongoose.createConnection(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Initialize GridFS and bind it to the connection
let gfs;
conn.once('open', () => {
    console.log('MongoDB connected and GridFS initialized');
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads'); // Files will be stored in 'uploads' collection
});

// Storage engine using GridFsStorage
const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
        if (file.mimetype.startsWith('application/') || file.mimetype.startsWith('image/')) {
            return {
                filename: file.originalname,
                bucketName: 'uploads', // Specify the bucket name
            };
        }
        return null; // Reject files that are not application types
    },
});

const upload = multer({ storage });

// Upload endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
    // Check if the file was uploaded
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }

    // Extract the subject from the request body
    const subject = req.body.subject || 'general'; // Default to 'general' if not provided

    // Update the file's filename to include the subject (optional)
    const newFilename = `${subject}-${req.file.originalname}`;

    // Update the file's filename in the GridFS collection
    await gfs.files.updateOne(
        { _id: req.file.id },
        { $set: { filename: newFilename } }
    );

    res.status(200).json({ message: 'File uploaded successfully', filename: newFilename });
});


// Fetch all files
app.get('/files', async (req, res) => {
    const subject = req.query.subject || ''; // Get subject from query parameter
    try {
        const regex = new RegExp(`^${subject}`); // Regex to match filenames starting with the subject
        const files = await gfs.files.find({ filename: { $regex: regex } }).toArray();

        if (!files || files.length === 0) {
            return res.status(404).json({ message: 'No files found' });
        }
        res.json(files);
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).json({ error: 'Error fetching files' });
    }
});


// Get a specific file by ID
// Get a specific file by ID
app.get('/file/:id', async (req, res) => {
    try {
        const file = await gfs.files.findOne({ _id: mongoose.Types.ObjectId(req.params.id) });
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        const readStream = gfs.createReadStream({ _id: file._id });

        // Set the correct headers for the response
        res.set({
            'Content-Type': file.contentType, // Use the content type stored in the database
            'Content-Disposition': `attachment; filename="${file.filename}"`, // Specify the filename
        });

        readStream.pipe(res);
    } catch (error) {
        console.error('Error fetching the file:', error);
        res.status(500).json({ error: 'Error fetching the file' });
    }
});


// Delete a file by ID
app.delete('/delete/:id', async (req, res) => {
    const fileId = req.params.id;
    try {
        // Logic to delete the file from GridFS
        const result = await gfs.files.deleteOne({ _id: mongoose.Types.ObjectId(fileId) });
        if (result.deletedCount === 1) {
            res.status(200).send('File deleted successfully.');
        } else {
            res.status(404).send('File not found.');
        }
    } catch (error) {
        console.error('Error deleting the file:', error);
        res.status(500).send('Internal server error.');
    }
});

// Connect to MongoDB with Mongoose
mongoose
    .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Mongoose connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Start the server
app.listen(PORT, () => {
    console.log('Server is running on port ${PORT}');
});  