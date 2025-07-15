import express from 'express';
const router = express.Router();

// Placeholder routes
router.get('/', (req, res) => {
  res.json({ message: 'Blog routes' });
});

export default router;