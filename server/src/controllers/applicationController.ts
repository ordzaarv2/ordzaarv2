import { Request, Response, NextFunction } from 'express';
import Application, { IApplication } from '../models/Application';
import path from 'path';
import multer from 'multer';
import mongoose from 'mongoose';
import Collection from '../models/Collection';
import Ordinal from '../models/Ordinal';

// Declare Multer types if not already available
declare global {
  namespace Express {
    namespace Multer {
      interface File {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination: string;
        filename: string;
        path: string;
        buffer: Buffer;
      }
    }
  }
}

// Get all applications
export const getApplications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const applications = await Application.find();
    
    res.status(200).json({
      success: true,
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

// Get application by ID
export const getApplicationById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

// Create application
export const createApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Log the full request body for debugging
    console.log('Request body:', JSON.stringify(req.body));
    
    // Extract all required fields
    const {
      name,
      description,
      creator,
      price,
      stats
    } = req.body;
    
    // Validate the required fields
    if (!name || !description || !creator || !price || !stats || !stats.totalSupply) {
      console.error('Missing required fields:', { name, description, creator, price, stats });
      return res.status(400).json({
        success: false,
        error: 'Missing required fields for application'
      });
    }
    
    // Generate a unique slug
    const timestamp = new Date().getTime().toString().slice(-6);
    const slug = name
      .toLowerCase()
      .replace(/[^\w ]+/g, '') // Remove non-word chars except spaces
      .replace(/ +/g, '-')     // Replace spaces with hyphens
      .trim() + '-' + timestamp;
    
    console.log('Creating application with generated slug:', slug);
    
    // Create a clean application object
    const cleanApplication = {
      name: String(name),
      description: String(description),
      creator: String(creator),
      price: String(price),
      stats: {
        totalSupply: Number(stats.totalSupply),
        minted: 0
      },
      slug: String(slug),
      status: 'pending' as const,
      submittedAt: new Date(),
      assets: { 
        images: [] 
      },
      isComplete: false
    };
    
    console.log('Clean application object:', JSON.stringify(cleanApplication));
    
    // Create the application document
    const application = await Application.create(cleanApplication);
    
    console.log('Application created successfully with ID:', application.id);
    
    res.status(201).json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Error creating application:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      if (error.name === 'ValidationError') {
        console.error('Mongoose validation error details:', error.message);
      } else if (error.name === 'MongoError' || error.name === 'MongoServerError') {
        console.error('MongoDB error details:', error.message);
      }
    }
    
    next(error);
  }
};

// Update application
export const updateApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }
    
    // Only allow updates if application is in pending status
    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Cannot update application after it has been processed'
      });
    }
    
    const updatedApplication = await Application.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: updatedApplication
    });
  } catch (error) {
    next(error);
  }
};

// Update application status (admin only)
export const updateApplicationStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const applicationId = req.params.id;
    
    console.log('Updating application status:', { applicationId, status });
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status value'
      });
    }
    
    if (!applicationId || !mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({
        success: false,
        error: `Invalid application ID: ${applicationId}`
      });
    }
    
    const application = await Application.findById(applicationId);
    console.log('Found application:', application ? application.id : 'Not found');
    
    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }
    
    application.status = status;
    
    // If approving, make sure the application is marked as complete
    if (status === 'approved' && !application.isComplete) {
      console.log('Auto-marking application as complete since it is being approved');
      application.isComplete = true;
    }
    
    await application.save();
    
    console.log('Application status updated successfully:', { id: application.id, status });
    
    // If application is approved, create a collection (regardless of isComplete or collectionCreated flags)
    if (status === 'approved') {
      console.log('Application approved, creating collection...');
      
      try {
        // Check if collection already exists
        const existingCollection = await Collection.findOne({ 
          applicationId: application._id 
        });
        
        if (existingCollection) {
          console.log('Collection already exists for this application:', existingCollection.id);
        } else {
          // Log the application assets for debugging
          console.log('Application assets:', JSON.stringify(application.assets));
          
          // Check if application has images
          const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
          let defaultImage = `${serverUrl}/uploads/placeholder.jpg`;
          let hasImages = application.assets && application.assets.images && application.assets.images.length > 0;
          
          console.log('Has uploaded images:', hasImages);
          if (hasImages) {
            console.log('Image paths in application:', application.assets.images);
          }
          
          // Log the image that will be used for the collection
          const imageToUse = hasImages ? application.assets.images[0] : defaultImage;
          console.log('Using this image for collection:', imageToUse);
          
          // Create collection
          const collection = await Collection.create({
            name: application.name,
            slug: application.slug,
            description: application.description,
            image: imageToUse,
            creator: application.creator,
            price: application.price,
            totalSupply: application.stats.totalSupply || 10, // Default to 10 if not specified
            minted: 0,
            stats: {
              volume: 0,
              sales: 0,
              floorPrice: application.price
            },
            settings: {
              isVisible: true,
              royaltyPercentage: 5
            },
            applicationId: application._id // Store reference to the application
          });
          
          console.log('Collection created with data:', JSON.stringify({
            id: collection.id,
            name: collection.name,
            totalSupply: collection.totalSupply,
            image: collection.image,
            slug: collection.slug
          }));
          
          // Create ordinals for the collection
          const ordinals = [];
          const totalSupply = application.stats.totalSupply || 10;
          
          for (let i = 0; i < totalSupply; i++) {
            let ordinalImage = defaultImage;
            
            // If there are images, select one using the modulo operation
            if (hasImages) {
              ordinalImage = application.assets.images[i % application.assets.images.length];
            }
            
            const ordinal = await Ordinal.create({
              name: `${application.name} #${i + 1}`,
              description: application.description,
              image: ordinalImage,
              ordinalNumber: i + 1,
              collectionId: collection._id,
              price: application.price,
              owner: application.creator,
              status: 'pending'
            });
            ordinals.push(ordinal);
          }
          
          console.log(`Created ${ordinals.length} ordinals for collection`);
          
          // Update application to mark that collection was created
          application.collectionCreated = true;
          await application.save();
          
          console.log('Application updated with collectionCreated=true');
          
          // Return the updated response with collection info
          return res.status(200).json({
            success: true,
            data: application,
            collection: collection
          });
        }
      } catch (collectionError) {
        console.error('Error creating collection:', collectionError);
        if (collectionError instanceof Error) {
          console.error('Error details:', collectionError.message);
          console.error('Error stack:', collectionError.stack);
        }
        // Continue with the response
      }
    }
    
    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    next(error);
  }
};

// Add assets to application
export const addApplicationAssets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Log the request details for debugging
    console.log('Adding assets to application:', req.params.id);
    console.log('Request body:', req.body);
    console.log('Request files type:', typeof req.files);
    console.log('Request files is array:', Array.isArray(req.files));
    console.log('Request files length:', req.files ? (Array.isArray(req.files) ? req.files.length : 'not array') : 'undefined');
    
    if (req.files && Array.isArray(req.files)) {
      console.log('First file in request:', req.files[0]);
    }
    
    // Get the uploaded file paths
    const files = req.files as Express.Multer.File[];
    let images: string[] = [];
    
    if (files && files.length > 0) {
      console.log(`Processing ${files.length} uploaded files`);
      
      // Convert uploads to URLs (relative to the server)
      images = files.map(file => {
        const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
        const imagePath = `${serverUrl}/uploads/${path.basename(file.path)}`;
        console.log(`Mapped ${file.originalname} to ${imagePath}`);
        return imagePath;
      });
      
      console.log('Processed image paths:', images);
    } else if (req.body.images) {
      // Fallback if images are sent in the request body
      console.log('No files found, checking for images in request body');
      
      if (typeof req.body.images === 'string') {
        images = [req.body.images];
        console.log('Found single image in body:', images[0]);
      } else if (Array.isArray(req.body.images)) {
        images = req.body.images;
        console.log(`Found ${images.length} images in body array`);
      } else {
        console.log('Images in body has unexpected type:', typeof req.body.images);
      }
    }
    
    if (images.length === 0) {
      console.log('No images were found in the request');
      return res.status(400).json({
        success: false,
        error: 'No images were uploaded',
        requestInfo: {
          hasFiles: !!req.files,
          filesLength: req.files ? (Array.isArray(req.files) ? req.files.length : 'not array') : 'undefined',
          bodyKeys: Object.keys(req.body),
          hasBodyImages: !!req.body.images,
          bodyImagesType: req.body.images ? typeof req.body.images : 'undefined'
        }
      });
    }
    
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      console.log('Application not found with ID:', req.params.id);
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }
    
    console.log('Found application:', application.id);
    console.log('Current assets before update:', application.assets);
    
    // Update assets
    application.assets.images = images;
    await application.save();
    
    console.log('Updated application assets, new images:', application.assets.images);
    
    res.status(200).json({
      success: true,
      data: application,
      imagesAdded: images
    });
  } catch (error) {
    console.error('Error adding assets:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    next(error);
  }
};

// Finalize application
export const finalizeApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }
    
    // Check if application has all required information
    if (!application.name || !application.description || !application.price) {
      return res.status(400).json({
        success: false,
        error: 'Missing required information'
      });
    }
    
    // Check if application has images - now just a warning, not a blocker
    if (!application.assets.images || application.assets.images.length === 0) {
      console.warn('Application being finalized without images:', application.id);
      // We'll continue anyway and not block finalization
    }
    
    // Mark as complete
    application.isComplete = true;
    await application.save();
    
    res.status(200).json({
      success: true,
      data: application,
      message: 'Application finalized successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Test create application (simplified for debugging)
export const testCreateApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Test create application request body:', req.body);
    
    // Hard-code a test application with all required fields
    const testApp = {
      name: 'Test Application',
      slug: 'test-app-' + Date.now(),
      description: 'This is a test application',
      creator: 'test-user',
      price: '0.001',
      status: 'pending',
      submittedAt: new Date(),
      stats: {
        totalSupply: 100,
        minted: 0
      },
      assets: {
        images: []
      },
      isComplete: false
    };
    
    console.log('Creating test application with data:', testApp);
    
    // Directly create using the model
    const application = new Application(testApp);
    await application.save();
    
    console.log('Test application created successfully with ID:', application.id);
    
    res.status(201).json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Error creating test application:', error);
    next(error);
  }
}; 