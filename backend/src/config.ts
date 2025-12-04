import dotenv from 'dotenv';
import path from 'path';

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local';
dotenv.config({ path: path.resolve(__dirname, '../../', envFile) });

export const PORT = process.env.PORT || 5000;
export const PG_USER = process.env.POSTGRES_USER!;
export const PG_PASSWORD = process.env.POSTGRES_PASSWORD!;
export const PG_DB = process.env.POSTGRES_DB!;
export const PG_HOST = process.env.PG_HOST!;
export const PG_PORT = Number(process.env.PG_PORT || 5432);
