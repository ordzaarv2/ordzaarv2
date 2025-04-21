import express from 'express';
import {
  getCollections,
  getCollectionBySlug,
  getCollectionOrdinals,
  createCollection,
  updateCollection
} from '../controllers/collectionController';
import Collection from '../models/Collection';

const router = express.Router();

// Debug endpoint to check collection images
router.get('/debug-images', async (req, res) => {
  try {
    // Get all collections
    const collections = await Collection.find();
    
    const results = {
      totalCollections: collections.length,
      collectionsWithImages: 0,
      collectionsWithoutImages: 0,
      imagesStartingWithUpload: 0,
      collectionsFixed: 0,
      collectionDetails: []
    };
    
    // Count and categorize
    for (const collection of collections) {
      const collectionInfo = {
        id: collection._id.toString(),
        name: collection.name,
        hasImage: !!collection.image,
        imageValue: collection.image || 'null',
        applicationId: collection.applicationId ? collection.applicationId.toString() : null,
        fixed: false
      };
      
      // @ts-ignore
      results.collectionDetails.push(collectionInfo);
      
      if (collection.image) {
        results.collectionsWithImages++;
        
        if (collection.image.startsWith('/uploads/')) {
          results.imagesStartingWithUpload++;
        }
      } else {
        results.collectionsWithoutImages++;
        
        // Check if we should fix this collection
        if (req.query.fix === 'true') {
          const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
          collection.image = `${serverUrl}/uploads/placeholder.jpg`;
          await collection.save();
          collectionInfo.fixed = true;
          collectionInfo.imageValue = collection.image;
          results.collectionsFixed++;
        }
      }
    }
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error in debug-images endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred while debugging collection images'
    });
  }
});

// Get all collections
router.get('/', getCollections);

// Get collection by slug
router.get('/:slug', getCollectionBySlug);

// Get ordinals in collection
router.get('/:slug/ordinals', getCollectionOrdinals);

// Create collection (admin only)
router.post('/', createCollection);

// Update collection (admin only)
router.put('/:id', updateCollection);

export default router; 