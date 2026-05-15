// routes/contact.js
const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const {
  validateContact,
  sendContact,
  getContacts,
  marquerLu,
  deleteContact,
} = require('../controllers/contactController');

// Public
router.post('/', validateContact, sendContact);

// Admin (protégé)
router.get('/',              protect, getContacts);
router.patch('/:id/lu',     protect, marquerLu);
router.delete('/:id',       protect, deleteContact);

module.exports = router;
