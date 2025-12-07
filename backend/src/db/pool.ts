import pkg from 'pg'
import {PG_DB, PG_HOST, PG_PASSWORD, PG_PORT, PG_USER} from "../config.ts";

const {Pool} = pkg

export const pool = new Pool({
    user: PG_USER,
    password: PG_PASSWORD,
    host: PG_HOST,
    port: PG_PORT,
    database: PG_DB,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on('error', (error) => {
    console.log('Unexpected error on idle client', error);
    process.exit(-1);
});

export async function checkConnection() {
    try {
        const client = await pool.connect()
        console.log('✅ PostgreSQL connected successfully')
        client.release();
        return true;
    } catch (error) {
        console.error('❌ PostgreSQL connection error:', error);
        return false;
    }
}