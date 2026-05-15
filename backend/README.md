# 🌿 Touche Verte — Backend API

API REST Node.js/Express pour le site Touche Verte.  
Déployable gratuitement sur **Render**.

---

## 📁 Structure

```
toucheverte-backend/
├── server.js                  # Point d'entrée
├── config/
│   ├── db.js                  # Connexion MongoDB
│   └── cloudinary.js          # Config upload photos
├── models/
│   ├── Contact.js             # Modèle messages
│   ├── Realisation.js         # Modèle galerie
│   └── Admin.js               # Modèle admin
├── controllers/
│   ├── contactController.js   # Logique contact + emails
│   ├── realisationController.js # Logique galerie
│   └── authController.js      # Login admin
├── routes/
│   ├── contact.js
│   ├── realisations.js
│   └── auth.js
├── middleware/
│   └── auth.js                # Vérification JWT
├── admin.html                 # Panel admin (interface web)
├── .env.example               # Template variables d'env
└── package.json
```

---

## 🔑 Endpoints API

### Auth
| Méthode | Route | Accès | Description |
|---|---|---|---|
| POST | `/api/auth/setup` | Public (1 fois) | Créer le premier admin |
| POST | `/api/auth/login` | Public | Connexion admin → JWT |
| GET | `/api/auth/verify` | 🔒 Admin | Vérifier le token |

### Contact
| Méthode | Route | Accès | Description |
|---|---|---|---|
| POST | `/api/contact` | Public | Envoyer un message |
| GET | `/api/contact` | 🔒 Admin | Lister les messages |
| PATCH | `/api/contact/:id/lu` | 🔒 Admin | Marquer comme lu |
| DELETE | `/api/contact/:id` | 🔒 Admin | Supprimer un message |

### Réalisations
| Méthode | Route | Accès | Description |
|---|---|---|---|
| GET | `/api/realisations` | Public | Lister (filtre ?categorie=) |
| GET | `/api/realisations/admin` | 🔒 Admin | Lister tout |
| POST | `/api/realisations` | 🔒 Admin | Ajouter (avec image) |
| PUT | `/api/realisations/:id` | 🔒 Admin | Modifier |
| DELETE | `/api/realisations/:id` | 🔒 Admin | Supprimer |

---

## 🚀 Déploiement — Guide pas à pas

### 1. MongoDB Atlas (base de données)
1. Aller sur [cloud.mongodb.com](https://cloud.mongodb.com)
2. Créer un compte → **New Project** → **Build a Cluster** (choisir M0 gratuit)
3. **Database Access** → Add user → Login/Password → rôle `readWriteAnyDatabase`
4. **Network Access** → Add IP → `0.0.0.0/0` (autoriser tout)
5. **Connect** → Drivers → copier l'URL de connexion
6. L'URL ressemble à : `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/toucheverte`

### 2. Cloudinary (stockage photos)
1. Aller sur [cloudinary.com](https://cloudinary.com) → créer un compte
2. Dashboard → copier : **Cloud name**, **API Key**, **API Secret**

### 3. Resend (emails)
1. Aller sur [resend.com](https://resend.com) → créer un compte
2. **API Keys** → Create API Key → copier la clé
3. (Optionnel) Ajouter votre domaine pour envoyer depuis `@toucheverte.co.ma`

### 4. Render (hébergement backend)
1. Aller sur [render.com](https://render.com) → créer un compte
2. **New** → **Web Service** → connecter votre repo GitHub `toucheverte-backend`
3. Configurer :
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Onglet **Environment** → ajouter toutes les variables du `.env.example` :
   ```
   MONGODB_URI=...
   JWT_SECRET=...
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   RESEND_API_KEY=...
   EMAIL_TO=contact@toucheverte.co.ma
   EMAIL_FROM=noreply@toucheverte.co.ma
   FRONTEND_URL=https://toucheverte.vercel.app
   NODE_ENV=production
   ```
5. **Deploy** → noter l'URL : `https://toucheverte-api.onrender.com`

### 5. Vercel (hébergement frontend)
1. Aller sur [vercel.com](https://vercel.com) → créer un compte
2. **New Project** → importer le repo `toucheverte` (le frontend)
3. Pas de build command (site statique)
4. **Deploy** → URL : `https://toucheverte.vercel.app`

### 6. Connecter frontend ↔ backend

Dans `pages/contact.html`, remplacer l'action du formulaire :
```javascript
// Dans le <script> en bas de contact.html
const API_URL = 'https://toucheverte-api.onrender.com/api';

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const res = await fetch(`${API_URL}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prenom: document.getElementById('prenom').value,
      nom:    document.getElementById('nom').value,
      email:  document.getElementById('email').value,
      tel:    document.getElementById('tel').value,
      service: document.getElementById('service').value,
      message: document.getElementById('message').value,
    })
  });
  const data = await res.json();
  // Afficher succès ou erreur
});
```

Dans `js/main.js`, ajouter la récupération des photos depuis l'API :
```javascript
const API_URL = 'https://toucheverte-api.onrender.com/api';

async function loadGallery() {
  const res  = await fetch(`${API_URL}/realisations`);
  const data = await res.json();
  // Injecter data.data dans la grille
}
```

### 7. Créer le premier admin

Après déploiement, faire **une seule fois** :
```bash
curl -X POST https://toucheverte-api.onrender.com/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@toucheverte.co.ma","password":"MotDePasseSecret123"}'
```

Ensuite accéder au panel admin via :
`https://toucheverte-api.onrender.com/admin.html`

---

## 💻 Développement local

```bash
# 1. Installer les dépendances
npm install

# 2. Copier et remplir les variables d'env
cp .env.example .env

# 3. Lancer en mode dev (auto-reload)
npm run dev

# L'API tourne sur http://localhost:5000
```

---

## ⚠️ Notes importantes

- Le plan gratuit de Render **s'endort** après 15 min d'inactivité → 30s de délai au premier appel
- MongoDB Atlas M0 : 512 MB gratuit (largement suffisant)
- Cloudinary : 25 crédits/mois gratuit (~25 000 transformations)
- Resend : 3 000 emails/mois gratuit
