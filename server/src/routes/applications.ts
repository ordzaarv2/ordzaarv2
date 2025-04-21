import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  updateApplicationStatus,
  addApplicationAssets,
  finalizeApplication,
  testCreateApplication
} from '../controllers/applicationController';

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads/');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Setup file upload storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('Storage destination called for file:', file.originalname);
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Create a unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = `${uniqueSuffix}${ext}`;
    console.log('Generated filename:', filename, 'for original:', file.originalname);
    cb(null, filename);
  }
});

// File type filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  console.log('File filter called for:', file.originalname, 'mimetype:', file.mimetype);
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    console.log('File accepted:', file.originalname);
    cb(null, true);
  } else {
    console.log('File rejected (not an image):', file.originalname);
    cb(new Error('Only image files are allowed!'));
  }
};

// File upload middleware with error handling
const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  }
});

// Test upload endpoint
router.post('/test-upload', upload.single('image'), (req, res) => {
  console.log('Test upload endpoint called');
  console.log('Request body:', req.body);
  console.log('Request file:', req.file);
  
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded',
      requestHeaders: req.headers,
      requestContentType: req.get('content-type'),
      requestBodyKeys: Object.keys(req.body)
    });
  }
  
  return res.status(200).json({
    success: true,
    message: 'File uploaded successfully',
    file: req.file,
    url: `/uploads/${path.basename(req.file.path)}`,
    requestHeaders: {
      contentType: req.get('content-type')
    }
  });
});

// HTML test upload form
router.get('/upload-test', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Test Image Upload</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; }
        button { padding: 8px 16px; background: #4CAF50; color: white; border: none; cursor: pointer; }
        .result { margin-top: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 4px; }
        pre { background: #f5f5f5; padding: 10px; overflow: auto; }
      </style>
    </head>
    <body>
      <h1>Test Image Upload</h1>
      
      <form id="uploadForm" enctype="multipart/form-data">
        <div class="form-group">
          <label for="image">Select Image:</label>
          <input type="file" id="image" name="image" accept="image/*">
        </div>
        <button type="submit">Upload</button>
      </form>
      
      <div class="result" id="result" style="display: none;">
        <h2>Upload Result:</h2>
        <pre id="resultContent"></pre>
        <div id="imagePreview" style="display: none;">
          <h3>Uploaded Image:</h3>
          <img id="uploadedImage" style="max-width: 100%; max-height: 300px;">
        </div>
      </div>
      
      <script>
        document.getElementById('uploadForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const formData = new FormData();
          const fileInput = document.getElementById('image');
          
          if (fileInput.files.length === 0) {
            alert('Please select a file to upload');
            return;
          }
          
          formData.append('image', fileInput.files[0]);
          
          try {
            const response = await fetch('/api/v1/applications/test-upload', {
              method: 'POST',
              body: formData
            });
            
            const result = await response.json();
            
            // Display the result
            document.getElementById('result').style.display = 'block';
            document.getElementById('resultContent').textContent = JSON.stringify(result, null, 2);
            
            // Show image preview if upload was successful
            if (result.success && result.url) {
              document.getElementById('imagePreview').style.display = 'block';
              document.getElementById('uploadedImage').src = result.url;
            } else {
              document.getElementById('imagePreview').style.display = 'none';
            }
          } catch (error) {
            document.getElementById('result').style.display = 'block';
            document.getElementById('resultContent').textContent = 'Error: ' + error.message;
            document.getElementById('imagePreview').style.display = 'none';
          }
        });
      </script>
    </body>
    </html>
  `;
  
  res.send(html);
});

// Debug endpoint to check uploads directory
router.get('/debug-uploads', (req, res) => {
  try {
    // List files in uploads directory
    const files = fs.readdirSync(uploadsDir);
    
    // Get details of each file
    const fileDetails = files.map(file => {
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        path: filePath,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        isDirectory: stats.isDirectory(),
        url: `/uploads/${file}`
      };
    });
    
    res.status(200).json({
      success: true,
      uploadsDir,
      files: fileDetails,
      count: files.length
    });
  } catch (error) {
    console.error('Error in debug-uploads endpoint:', error);
    res.status(500).json({
      success: false,
      error: `Error accessing uploads directory: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
});

// Test endpoint for debugging
router.post('/test', testCreateApplication);

// Get all applications
router.get('/', getApplications);

// Get application by ID
router.get('/:id', getApplicationById);

// Create application
router.post('/', createApplication);

// Update application
router.put('/:id', updateApplication);

// Update application status
router.put('/:id/status', updateApplicationStatus);

// Add assets to application
router.put('/:id/assets', upload.array('images'), addApplicationAssets);

// Finalize application
router.put('/:id/finalize', finalizeApplication);

export default router; 