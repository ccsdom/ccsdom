// proxy-server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = 5001;

app.use(cors());

// Route corrigée (sans /api) pour correspondre à la réécriture Vite
app.get('/insee/:siren', async (req, res) => {
  const siren = req.params.siren;
  const apiKey = process.env.VITE_INSEE_API_KEY;

  try {
    const response = await fetch(`https://api.insee.fr/api-sirene/3.11/siren/${siren}`, {
      headers: {
        'X-INSEE-Api-Key-Integration': apiKey,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Erreur API INSEE' });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("❌ Erreur serveur proxy :", error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Proxy INSEE lancé sur http://localhost:${PORT}`);
});
