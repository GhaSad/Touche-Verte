const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  prenom:  { type: String, required: true, trim: true },
  nom:     { type: String, required: true, trim: true },
  email:   { type: String, required: true, trim: true, lowercase: true },
  tel:     { type: String, trim: true },
  service: {
    type: String,
    enum: ['bureau', 'amenagement', 'entretien', 'autre', ''],
    default: '',
  },
  message: { type: String, required: true },
  lu:      { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);
