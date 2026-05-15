const mongoose = require('mongoose');

const realisationSchema = new mongoose.Schema({
  titre:      { type: String, required: true, trim: true },
  categorie:  {
    type: String,
    required: true,
    enum: ['villas', 'residentiel', 'exterieur', 'interieur'],
  },
  lieu:       { type: String, trim: true },
  description:{ type: String, trim: true },
  image: {
    url:       { type: String, required: true },
    publicId:  { type: String, required: true }, // ID Cloudinary pour suppression
  },
  ordre:      { type: Number, default: 0 },       // pour le tri manuel
  publie:     { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Realisation', realisationSchema);
