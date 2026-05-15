const { Resend }  = require('resend');
const { body, validationResult } = require('express-validator');
const Contact = require('../models/Contact');

const resend = new Resend(process.env.RESEND_API_KEY);

/* ── Règles de validation ── */
exports.validateContact = [
  body('prenom').trim().notEmpty().withMessage('Le prénom est requis'),
  body('nom').trim().notEmpty().withMessage('Le nom est requis'),
  body('email').isEmail().withMessage('Email invalide').normalizeEmail(),
  body('message').trim().isLength({ min: 10 }).withMessage('Le message doit faire au moins 10 caractères'),
];

/* ── Envoi du formulaire de contact ── */
exports.sendContact = async (req, res) => {
  // Vérifier les erreurs de validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { prenom, nom, email, tel, service, message } = req.body;

  try {
    // 1. Sauvegarder en base de données
    const contact = await Contact.create({ prenom, nom, email, tel, service, message });

    // 2. Envoyer l'email de notification à l'entreprise
    await resend.emails.send({
      from: `Site Web Touche Verte <${process.env.EMAIL_FROM}>`,
      to:   process.env.EMAIL_TO,
      subject: `📬 Nouveau message de ${prenom} ${nom}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden">
          <div style="background:#1a3a1f;padding:28px 32px">
            <h1 style="color:#f7f3ec;margin:0;font-size:20px;font-weight:500">Nouveau message — Touche Verte</h1>
          </div>
          <div style="padding:32px">
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px 0;color:#888;font-size:13px;width:130px">Nom</td><td style="padding:8px 0;font-weight:500">${prenom} ${nom}</td></tr>
              <tr><td style="padding:8px 0;color:#888;font-size:13px">Email</td><td style="padding:8px 0"><a href="mailto:${email}" style="color:#2d6a35">${email}</a></td></tr>
              ${tel ? `<tr><td style="padding:8px 0;color:#888;font-size:13px">Téléphone</td><td style="padding:8px 0">${tel}</td></tr>` : ''}
              ${service ? `<tr><td style="padding:8px 0;color:#888;font-size:13px">Service</td><td style="padding:8px 0;text-transform:capitalize">${service}</td></tr>` : ''}
            </table>
            <div style="margin-top:24px;padding:20px;background:#f5f5f5;border-left:3px solid #2d6a35;border-radius:0 4px 4px 0">
              <p style="margin:0;font-size:14px;line-height:1.7;color:#333">${message.replace(/\n/g, '<br>')}</p>
            </div>
            <div style="margin-top:24px">
              <a href="mailto:${email}?subject=Re: Votre demande Touche Verte" style="background:#1a3a1f;color:#f7f3ec;padding:12px 24px;text-decoration:none;font-size:13px;letter-spacing:0.05em;display:inline-block">Répondre au client</a>
            </div>
          </div>
          <div style="background:#f5f5f5;padding:16px 32px;font-size:12px;color:#aaa">
            Message reçu le ${new Date().toLocaleDateString('fr-FR', { weekday:'long', year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' })}
          </div>
        </div>
      `,
    });

    // 3. Envoyer un email de confirmation au client
    await resend.emails.send({
      from: `Touche Verte <${process.env.EMAIL_FROM}>`,
      to:   email,
      subject: 'Votre message a bien été reçu — Touche Verte',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden">
          <div style="background:#1a3a1f;padding:28px 32px">
            <h1 style="color:#f7f3ec;margin:0;font-size:20px;font-weight:500">Merci pour votre message !</h1>
          </div>
          <div style="padding:32px">
            <p style="color:#333;line-height:1.7">Bonjour <strong>${prenom}</strong>,</p>
            <p style="color:#333;line-height:1.7">Nous avons bien reçu votre message et nous vous répondrons dans les <strong>48 heures</strong>.</p>
            <p style="color:#333;line-height:1.7">En attendant, n'hésitez pas à découvrir nos réalisations sur notre site.</p>
            <div style="margin-top:28px;padding:20px;background:#f5f5f5;border-radius:4px">
              <p style="margin:0 0 4px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.1em">Votre message</p>
              <p style="margin:0;font-size:14px;color:#333;line-height:1.7">${message.replace(/\n/g, '<br>')}</p>
            </div>
          </div>
          <div style="background:#1a3a1f;padding:20px 32px;text-align:center">
            <p style="color:rgba(247,243,236,.6);font-size:12px;margin:0">© 2025 Touche Verte SARL — Casablanca, Maroc</p>
          </div>
        </div>
      `,
    });

    res.status(201).json({
      success: true,
      message: 'Message envoyé avec succès',
      data: { id: contact._id },
    });

  } catch (error) {
    console.error('Erreur contact:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur, réessayez plus tard' });
  }
};

/* ── Lister les messages (admin) ── */
exports.getContacts = async (req, res) => {
  try {
    const { page = 1, limit = 20, lu } = req.query;
    const filter = lu !== undefined ? { lu: lu === 'true' } : {};

    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Contact.countDocuments(filter);

    res.json({
      success: true,
      data: contacts,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ── Marquer un message comme lu ── */
exports.marquerLu = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { lu: true },
      { new: true }
    );
    if (!contact) return res.status(404).json({ success: false, message: 'Message introuvable' });
    res.json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ── Supprimer un message ── */
exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ success: false, message: 'Message introuvable' });
    res.json({ success: true, message: 'Message supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
