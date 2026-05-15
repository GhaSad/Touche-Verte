require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');
const connectDB  = require('./config/db');

const app = express();

// ── Connexion MongoDB ──
connectDB();

// ── Sécurité & middleware ──
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS — autoriser le frontend Vercel
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://127.0.0.1:5500',  // Live Server VS Code
    /\.vercel\.app$/,          // Toutes les previews Vercel
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
}));

// Rate limiting — limiter les abus sur le formulaire de contact
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                    // 5 envois max par IP
  message: { success: false, message: 'Trop de demandes, réessayez dans 15 minutes' },
});

// ── Routes ──
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/contact',      contactLimiter, require('./routes/contact'));
app.use('/api/realisations', require('./routes/realisations'));

// ── Route de santé (pour Render) ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', env: process.env.NODE_ENV, timestamp: new Date() });
});

// ── 404 ──
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} introuvable` });
});

// ── Gestionnaire d'erreurs global ──
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erreur interne du serveur',
  });
});

// ── Démarrage ──
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT} (${process.env.NODE_ENV})`);
});
