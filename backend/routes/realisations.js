const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const { uploadRealisation } = require('../config/cloudinary');
const {
  getRealisations,
  getAllAdmin,
  createRealisation,
  updateRealisation,
  deleteRealisation,
} = require('../controllers/realisationController');

// Public
router.get('/', getRealisations);

// Admin (protégé)
router.get('/admin',      protect, getAllAdmin);
router.post('/',          protect, uploadRealisation.single('image'), createRealisation);
router.put('/:id',        protect, uploadRealisation.single('image'), updateRealisation);
router.delete('/:id',     protect, deleteRealisation);

module.exports = router;
