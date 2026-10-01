import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './server/db.js';
import { Transaction } from './src/types/banking.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // Body parsing middleware (high limit for base64 ID photos)
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // CORS headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // ==========================================
  // SERVER DATABASE API ROUTES (/api/*)
  // ==========================================

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', serverTime: new Date().toISOString(), database: 'active' });
  });

  // Get all users (Admin & Sync)
  app.get('/api/users', (req, res) => {
    try {
      const users = db.getAllUsers();
      res.json({ success: true, users });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get single user by ID
  app.get('/api/users/:id', (req, res) => {
    try {
      const user = db.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
      }
      res.json({ success: true, user });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // User Login (Authenticates credentials against central server database)
  app.post('/api/auth/login', (req, res) => {
    try {
      const { login, pin } = req.body;
      if (!login || !pin) {
        return res.status(400).json({ success: false, message: 'Identifiant et code PIN requis' });
      }

      const user = db.findUserByCredentials(login, pin);
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Identifiant bancaire ou code PIN incorrect. Veuillez vérifier vos accès.' 
        });
      }

      res.json({ success: true, user });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // User Registration (New client created on server database)
  app.post('/api/auth/register', (req, res) => {
    try {
      const { name, email, phone, pin, initialBalance } = req.body;
      if (!name || !email) {
        return res.status(400).json({ success: false, message: 'Nom et email requis' });
      }

      const user = db.registerUser(name, email, phone, pin, Number(initialBalance) || 0);
      res.json({ success: true, user });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Update user state (Generic update for balance, transactions, card, application, etc.)
  app.put('/api/users/:id', (req, res) => {
    try {
      const existing = db.getUserById(req.params.id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
      }

      const updated = { ...existing, ...req.body, id: existing.id };
      db.updateUser(updated);
      res.json({ success: true, user: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Add a new transaction (transfer, deposit, admin credit, etc.)
  app.post('/api/users/:id/transactions', (req, res) => {
    try {
      const user = db.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
      }

      const tx: Transaction = req.body;
      if (!tx || !tx.amount) {
        return res.status(400).json({ success: false, message: 'Données de transaction invalides' });
      }

      // Add transaction to history
      user.transactions.unshift(tx);

      // Adjust account balance accordingly
      if (tx.type === 'expense') {
        user.account.balance -= Math.abs(tx.amount);
        user.account.availableBalance -= Math.abs(tx.amount);
      } else if (tx.type === 'income') {
        user.account.balance += Math.abs(tx.amount);
        user.account.availableBalance += Math.abs(tx.amount);
      }

      // Add notification
      user.notifications.unshift({
        id: `notif-tx-${Date.now()}`,
        title: tx.type === 'expense' ? 'Überweisung ausgeführt' : 'Gutschrift verbucht',
        message: `${tx.type === 'expense' ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)} €: ${tx.purpose}`,
        timestamp: 'Gerade eben',
        isRead: false,
        category: 'banking',
      });

      db.updateUser(user);
      res.json({ success: true, user, transaction: tx });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Upload German ID Document / Passport photo directly to user account
  app.post('/api/users/:id/document', (req, res) => {
    try {
      const user = db.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
      }

      const { name, dataUrl, fileSize, documentType } = req.body;
      if (!dataUrl) {
        return res.status(400).json({ success: false, message: 'Image ou document manquant' });
      }

      user.idDocument = {
        name: name || 'Deutscher_Staatsbuergerschaftsnachweis.jpg',
        dataUrl,
        uploadedAt: new Date().toLocaleDateString('de-DE'),
        fileSize: fileSize || '1.2 MB',
        documentType: documentType || 'Personalausweis (Bundesrepublik Deutschland)',
      };

      if (user.application) {
        user.application.documents = {
          ...user.application.documents,
          idDocumentUploaded: true,
          idDocumentName: user.idDocument.name,
          idDocumentData: user.idDocument.dataUrl,
          idDocumentType: user.idDocument.documentType,
          idDocumentUploadedAt: user.idDocument.uploadedAt,
        };
      }

      db.updateUser(user);
      res.json({ success: true, user, idDocument: user.idDocument });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Update user PIN
  app.post('/api/users/:id/pin', (req, res) => {
    try {
      const user = db.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
      }

      const { pin } = req.body;
      if (!pin) {
        return res.status(400).json({ success: false, message: 'Nouveau PIN requis' });
      }

      user.pin = pin.trim();
      db.updateUser(user);
      res.json({ success: true, user });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Delete user (Admin)
  app.delete('/api/users/:id', (req, res) => {
    try {
      const success = db.deleteUser(req.params.id);
      if (!success) {
        return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
      }
      res.json({ success: true, message: 'Utilisateur supprimé de la base de données' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Bulk Synchronize all accounts
  app.post('/api/sync', (req, res) => {
    try {
      const { users } = req.body;
      if (Array.isArray(users)) {
        db.bulkSync(users);
      }
      res.json({ success: true, users: db.getAllUsers() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ==========================================
  // VITE OR STATIC FRONTEND SERVING
  // ==========================================
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AURA BANK SERVER] Running at http://0.0.0.0:${PORT} (Persistent DB active)`);
  });
}

startServer().catch((err) => {
  console.error('[AURA BANK SERVER] Fatal error:', err);
  process.exit(1);
});
