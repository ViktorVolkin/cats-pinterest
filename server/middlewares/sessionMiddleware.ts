import { type NextFunction, type Request, type Response } from 'express';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

export interface RequestWithSession extends Request {
  sessionId?: string;
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const sessionMiddleware = async (req: RequestWithSession, res: Response, next: NextFunction) => {
  try {
    let sessionId = req.cookies['session_id'];
    
    if (!sessionId) {
      sessionId = uuidv4();
      await pool.query(
        'INSERT INTO sessions (session_id) VALUES ($1)',
        [sessionId]
      );
      res.cookie('session_id', sessionId, { 
        maxAge: 1000 * 60 * 60 * 24 * 180, 
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      req.sessionId = sessionId;
    } else {
      const result = await pool.query(
        'UPDATE sessions SET last_time_used = NOW() WHERE session_id = $1 RETURNING session_id',
        [sessionId]
      );
      
      if (result.rowCount === 0) {
        sessionId = uuidv4();
        await pool.query(
          'INSERT INTO sessions (session_id) VALUES ($1)',
          [sessionId]
        );
        res.cookie('session_id', sessionId, { 
          maxAge: 1000 * 60 * 60 * 24 * 180, 
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
      }
      req.sessionId = sessionId;
    }
    next();
  } catch (error) {
    console.error('Session error:', error);
    res.status(500).json({ error: 'Session management error' });
  }
};
