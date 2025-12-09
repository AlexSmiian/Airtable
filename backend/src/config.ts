import dotenv from 'dotenv';
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local';
dotenv.config({path: path.resolve(__dirname, '../../', envFile)});

export const PORT = process.env.PORT || 7000;
export const PG_USER = process.env.POSTGRES_USER || 'postgres';
export const PG_PASSWORD = process.env.POSTGRES_PASSWORD || 'postgres';
export const PG_DB = process.env.POSTGRES_DB || 'airtable';
export const PG_HOST = process.env.PG_HOST || 'db';
export const PG_PORT = Number(process.env.PG_PORT || 5432);

export const REDIS_HOST = process.env.REDIS_HOST || 'redis';
export const REDIS_PORT = Number(process.env.REDIS_PORT || 6379);