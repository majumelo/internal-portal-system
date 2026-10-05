import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });

// fallback: monta a url a partir das variáveis separadas
if (!process.env.DATABASE_URL) {
  const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
  if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
    throw new Error('Configure DATABASE_URL ou DB_HOST, DB_USER, DB_PASSWORD e DB_NAME no backend/.env.');
  }

  const host = DB_HOST.includes(':') && !DB_HOST.startsWith('[') ? `[${DB_HOST}]` : DB_HOST;
  const ssl = process.env.DB_SSL === 'true' ? '?sslmode=require' : '';
  process.env.DATABASE_URL = `postgresql://${encodeURIComponent(DB_USER)}:${encodeURIComponent(DB_PASSWORD)}@${host}:${Number(process.env.DB_PORT || 5432)}/${encodeURIComponent(DB_NAME)}${ssl}`;
}

const prisma = new PrismaClient();

export default prisma;