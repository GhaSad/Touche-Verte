const Realisation = require('../models/Realisation');
const { cloudinary } = require('../config/cloudinary');

/* ── Lister les réalisations (public) ── */
exports.getRealisations = async (req, res) => {
  try {
    const { categorie } = req.query;
    const filter = { publie: true };
    if (categorie && categorie !== 'all') filter.categorie = categorie;

    const realisations = await Realisation.find(filter).sort({ ordre: 1, createdAt: -1 });
    res.json({ success: true, data: realisations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ── Lister toutes (admin, inclus non publiées) ── */
exports.getAllAdmin = async (req, res) => {
  try {
    const realisations = await Realisation.find().sort({ ordre: 1, createdAt: -1 });
    res.json({ success: true, data: realisations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ── Ajouter une réalisation ── */
exports.createRealisation = async (req, res) => {
  try {
    // req.file est injecté par multer-storage-cloudinary
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image requise' });
    }

    const { titre, categorie, lieu, description, ordre } = req.body;

    const realisation = await Realisation.create({
      titre,
      categorie,
      lieu,
      description,
      ordre: ordre || 0,
      image: {
        url:      req.file.path,       // URL Cloudinary
        publicId: req.file.filename,   // ID pour suppression
      },
    });

    res.status(201).json({ success: true, data: realisation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ── Modifier une réalisation ── */
exports.updateRealisation = async (req, res) => {
  try {
    const realisation = await Realisation.findById(req.params.id);
    if (!realisation) {
      return res.status(404).json({ success: false, message: 'Réalisation introuvable' });
    }

    const { titre, categorie, lieu, description, ordre, publie } = req.body;

    // Si une nouvelle image est uploadée, supprimer l'ancienne de Cloudinary
    if (req.file) {
      await cloudinary.uploader.destroy(realisation.image.publicId);
      realisation.image = {
        url:      req.file.path,
        publicId: req.file.filename,
      };
    }

    if (titre)       realisation.titre       = titre;
    if (categorie)   realisation.categorie   = categorie;
    if (lieu)        realisation.lieu        = lieu;
    if (description) realisation.description = description;
    if (ordre !== undefined) realisation.ordre = ordre;
    if (publie !== undefined) realisation.publie = publie === 'true' || publie === true;

    await realisation.save();
    res.json({ success: true, data: realisation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ── Supprimer une réalisation ── */
exports.deleteRealisation = async (req, res) => {
  try {
    const realisation = await Realisation.findById(req.params.id);
    if (!realisation) {
      return res.status(404).json({ success: false, message: 'Réalisation introuvable' });
    }

    // Supprimer l'image de Cloudinary
    await cloudinary.uploader.destroy(realisation.image.publicId);
    await realisation.deleteOne();

    res.json({ success: true, message: 'Réalisation supprimée' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
