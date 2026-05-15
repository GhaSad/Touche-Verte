const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const { login, setup, verifyToken } = require('../controllers/authController');

router.post('/login',  login);
router.post('/setup',  setup);        // À appeler une seule fois pour créer l'admin
router.get('/verify',  protect, verifyToken);

module.exports = router;
