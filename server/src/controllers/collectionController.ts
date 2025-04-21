import { Request, Response, NextFunction } from 'express';
import Collection, { ICollection } from '../models/Collection';
import Ordinal from '../models/Ordinal';
import Application from '../models/Application';
import mongoose from 'mongoose';

// Get all collections
export const getCollections = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const collections = await Collection.find({
      'settings.isVisible': true
    });
    
    res.status(200).json({
      success: true,
      data: collections
    });
  } catch (error) {
    next(error);
  }
};

// Get collection by slug
export const getCollectionBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const collection = await Collection.findOne({ slug: req.params.slug });
    
    if (!collection) {
      return res.status(404).json({
        success: false,
        error: 'Collection not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: collection
    });
  } catch (error) {
    next(error);
  }
};

// Get ordinals in collection
export const getCollectionOrdinals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const collection = await Collection.findOne({ slug: req.params.slug });
    
    if (!collection) {
      return res.status(404).json({
        success: false,
        error: 'Collection not found'
      });
    }
    
    const ordinals = await Ordinal.find({ collectionId: collection._id });
    
    res.status(200).json({
      success: true,
      data: ordinals
    });
  } catch (error) {
    next(error);
  }
};

// Create collection from application (admin only)
export const createCollection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { applicationId } = req.body;
    
    console.log('Creating collection from application:', applicationId);
    
    if (!applicationId) {
      return res.status(400).json({
        success: false,
        error: 'Application ID is required'
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({
        success: false,
        error: `Invalid application ID format: ${applicationId}`
      });
    }
    
    // Get application data
    const application = await Application.findById(applicationId);
    
    console.log('Found application:', application ? {
      id: application.id,
      name: application.name,
      status: application.status,
      isComplete: application.isComplete
    } : 'Not found');
    
    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }
    
    // Check if application is complete and approved
    if (!application.isComplete) {
      return res.status(400).json({
        success: false,
        error: 'Application is not complete'
      });
    }
    
    if (application.status !== 'approved') {
      return res.status(400).json({
        success: false,
        error: 'Application has not been approved'
      });
    }
    
    // Check if collection already exists
    const existingCollection = await Collection.findOne({ 
      applicationId: application._id 
    });
    
    if (existingCollection) {
      return res.status(400).json({
        success: false,
        error: 'Collection already exists for this application'
      });
    }
    
    // Create collection
    const collection = await Collection.create({
      name: application.name,
      slug: application.slug,
      description: application.description,
      image: application.assets.images[0] || '',
      creator: application.creator,
      price: application.price,
      totalSupply: application.stats.totalSupply,
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
    
    console.log('Collection created:', {
      id: collection.id,
      name: collection.name,
      totalSupply: collection.totalSupply
    });
    
    // Create ordinals for the collection
    const ordinals = [];
    for (let i = 0; i < application.stats.totalSupply; i++) {
      const ordinal = await Ordinal.create({
        name: `${application.name} #${i + 1}`,
        description: application.description,
        image: application.assets.images[i % application.assets.images.length],
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
    
    res.status(201).json({
      success: true,
      data: {
        collection,
        ordinals
      }
    });
  } catch (error) {
    console.error('Error creating collection:', error);
    next(error);
  }
};

// Update collection settings (admin only)
export const updateCollection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const collection = await Collection.findById(req.params.id);
    
    if (!collection) {
      return res.status(404).json({
        success: false,
        error: 'Collection not found'
      });
    }
    
    const updatedCollection = await Collection.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: updatedCollection
    });
  } catch (error) {
    next(error);
  }
}; 