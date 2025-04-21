import express from 'express';

const router = express.Router();

// Note: In the completed version, this will be connected to the Web3 integration
// These are placeholder routes for now

// Get all ordinals
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'This endpoint will be implemented by the Web3 team'
  });
});

// Get ordinal by ID
router.get('/:id', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'This endpoint will be implemented by the Web3 team'
  });
});

// Mint an ordinal (placeholder)
router.post('/mint', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'This endpoint will be implemented by the Web3 team'
  });
});

export default router; 