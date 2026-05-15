const jwt   = require('jsonwebtoken');
const Admin = require('../models/Admin');

/* ── Générer un JWT ── */
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

/* ── Connexion admin ── */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email et mot de passe requis' });
  }

  try {
    const admin = await Admin.findOne({ email });
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
    }

    const token = signToken(admin._id);
    res.json({
      success: true,
      token,
      data: { id: admin._id, email: admin.email },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ── Créer le premier admin (à appeler une seule fois) ── */
exports.setup = async (req, res) => {
  try {
    const count = await Admin.countDocuments();
    if (count > 0) {
      return res.status(403).json({ success: false, message: 'Admin déjà configuré' });
    }

    const { email, password } = req.body;
    if (!email || !password || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Email valide et mot de passe (min 8 car.) requis' });
    }

    const admin = await Admin.create({ email, password });
    const token = signToken(admin._id);

    res.status(201).json({
      success: true,
      message: 'Admin créé avec succès',
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ── Vérifier le token (pour le panel admin) ── */
exports.verifyToken = async (req, res) => {
  res.json({ success: true, data: { id: req.admin._id, email: req.admin.email } });
};
