import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { connectDB } from './db/client';
import { errorHandler } from './middleware/errorHandler';
import router from './routes';

const app = express();

// ─── Global middleware ────────────────────────────────────────────────────────

app.use(cors({
  // In development, allow the Vite dev server.
  // In production, set CORS_ORIGIN env var to your frontend domain.
  origin: env.NODE_ENV === 'development'
    ? ['http://localhost:5173', 'http://localhost:3000']
    : process.env.CORS_ORIGIN ?? '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use(router);

// 404 catch-all — must come after all routes
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error:   'Route not found',
  });
});

// Global error handler — must be last and must have 4 params
app.use(errorHandler);

// ─── Bootstrap ───────────────────────────────────────────────────────────────

async function start(): Promise<void> {
  await connectDB();

  app.listen(env.PORT, () => {
    console.log(`\n🚚  FreightFlow AI backend`);
    console.log(`🌐  http://localhost:${env.PORT}`);
    console.log(`📋  Health: http://localhost:${env.PORT}/health`);
    console.log(`📦  Quotes: http://localhost:${env.PORT}/api/quotes`);
    console.log(`🗺️   Lanes:  http://localhost:${env.PORT}/api/lanes`);
    console.log(`\n📦  Environment: ${env.NODE_ENV}\n`);
  });
}

start().catch((err) => {
  console.error('❌  Failed to start server:', err);
  process.exit(1);
});
