import express from 'express';
import cookieParser from 'cookie-parser';
import { sessionMiddleware } from './middlewares/sessionMiddleware';
import { errorHandler } from './middlewares/errorHandler';
import { type RequestWithSession } from './middlewares/sessionMiddleware';
import cors from "cors";
import { Pool } from 'pg';
import { isURL } from 'validator';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      session_id VARCHAR(36) PRIMARY KEY,
      last_time_used TIMESTAMP DEFAULT NOW()
    );
  `);
  
  await pool.query(`
    CREATE TABLE IF NOT EXISTS favourites (
      id SERIAL PRIMARY KEY,
      session_id VARCHAR(36) REFERENCES sessions(session_id) ON DELETE CASCADE,
      image_id VARCHAR(255) NOT NULL,
      url TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(session_id, image_id)
    );
  `);
}

const app = express();
const port = process.env.PORT || 3000;
const CAT_API_KEY = process.env.CAT_API_KEY || '';
const CAT_API_BASE_URL = process.env.CAT_API_BASE_URL || '';

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost', 'http://localhost:80'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(sessionMiddleware);

app.get('/', (req: RequestWithSession, res) => {
  res.json({ 
    message: 'Welcome to Cats Pinterest!',
    sessionId: req.sessionId
  });
});

app.get('/images', async (req: RequestWithSession, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 0;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const url = new URL(`${CAT_API_BASE_URL}/images/search`);
    url.searchParams.append('limit', limit.toString());
    url.searchParams.append('page', page.toString());
    url.searchParams.append('has_breeds', '1');
    url.searchParams.append('order', 'RAND');
    
    const response = await fetch(url.toString(), {
      headers: { 'x-api-key': CAT_API_KEY }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`CatAPI error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
const images = await response.json() as Array<{ id: string; url: string }>;
    
    const favResult = await pool.query(
      'SELECT image_id FROM favourites WHERE session_id = $1',
      [req.sessionId]
    );
    
    const favoriteIds = new Set(favResult.rows.map(row => row.image_id));
    
    const imagesWithFavorites = images.map((img) => ({
      ...img,
      is_favorite: favoriteIds.has(img.id)
    }));
    
    res.json(imagesWithFavorites);
  } catch (error) {
    next(error);
  }
});


app.post('/favourites', async (req: RequestWithSession, res, next) => {
  try {
    const { image_id } = req.body;
    
    if (!image_id) {
      res.status(400).json({ error: 'image_id is required' });
      return
    }
        const verifyResponse = await fetch(`${CAT_API_BASE_URL}/images/${image_id}`, {
      headers: { 'x-api-key': CAT_API_KEY }
    });
    
    if (!verifyResponse.ok) {
      res.status(404).json({ error: 'Image not found in CatAPI' });
      return
    }
    
    const catData = await verifyResponse.json() as { id: string; url: string };
    
    if (!catData.url || !isURL(catData.url)) {
      res.status(400).json({ error: 'Invalid image URL from CatAPI' });
      return 
    }
    
    const validUrl = catData.url;
    
    const existing = await pool.query(
      `SELECT id FROM favourites 
       WHERE session_id = $1 AND image_id = $2`,
      [req.sessionId, image_id]
    );
    
    if (existing.rows.length > 0) {
      res.status(409).json({ 
        error: 'Cat already in favorites',
        id: existing.rows[0].id
      });
      return
    }
    
    const result = await pool.query(
      `INSERT INTO favourites (session_id, image_id, url)
       VALUES ($1, $2, $3)
       RETURNING id, image_id, url, created_at`,
      [req.sessionId, image_id, validUrl]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

app.delete('/favourites/:id', async (req: RequestWithSession, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `DELETE FROM favourites 
       WHERE id = $1 AND session_id = $2
       RETURNING id`,
      [id, req.sessionId]
    );
    
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Favorite not found' });
      return
    }
    
    res.json({ message: 'Favorite removed', id: result.rows[0].id });
  } catch (error) {
    next(error);
  }
});

app.get('/favourites', async (req: RequestWithSession, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, image_id, url, created_at 
       FROM favourites 
       WHERE session_id = $1 
       ORDER BY created_at DESC`,
      [req.sessionId]
    );
    
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

app.use(errorHandler);

createTables().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}).catch((error) => {
  console.error('Error creating tables:', error);
  process.exit(1);
});