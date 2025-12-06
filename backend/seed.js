// backend/seed.js
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local';
dotenv.config({ path: path.resolve(__dirname, '../', envFile) });

const pool = new Pool({
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    host: process.env.PG_HOST,
    port: Number(process.env.PG_PORT || 5432),
});

const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'Chris', 'Lisa', 'Mark', 'Anna'];
const lastNames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson'];
const statuses = ['Active', 'Pending', 'Completed', 'Cancelled', 'On Hold'];
const categories = ['Marketing', 'Sales', 'Development', 'Design', 'Support'];
const priorities = ['Low', 'Medium', 'High', 'Critical'];
const attributesOptions = ['size', 'color', 'weight', 'height', 'width', 'depth', 'material', 'brand', 'model', 'capacity', 'power', 'voltage', 'speed', 'temperature', 'length', 'diameter'];

function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seed() {
    const client = await pool.connect();

    try {
        console.log('🌱 Starting database seed...');

        await client.query('BEGIN');

        const countResult = await client.query('SELECT COUNT(*) FROM records');
        const existingCount = parseInt(countResult.rows[0].count);

        if (existingCount > 0) {
            console.log(`⚠️  Database already has ${existingCount.toLocaleString()} records`);
            console.log('Skipping seed.');
            await client.query('ROLLBACK');
            return;
        }

        const TOTAL_RECORDS = 50000;
        const BATCH_SIZE = 100;
        console.log(`📝 Creating ${TOTAL_RECORDS.toLocaleString()} records...`);

        for (let i = 0; i < TOTAL_RECORDS; i += BATCH_SIZE) {
            const batchSize = Math.min(BATCH_SIZE, TOTAL_RECORDS - i);

            // Генеруємо VALUES для одного батча
            const valueRows = [];
            for (let j = 0; j < batchSize; j++) {
                const firstName = randomItem(firstNames);
                const lastName = randomItem(lastNames);

                const title = `${firstName} ${lastName}`;
                const description = `Project ${i + j + 1}`;
                const category = JSON.stringify([
                    randomItem(categories),
                    randomItem(categories),
                    randomItem(categories),
                    randomItem(categories),
                ]);
                const status = randomItem(statuses);
                const amount = randomNumber(1000, 100000);
                const quantity = randomNumber(1, 500);
                const price = parseFloat((Math.random() * 500).toFixed(2));
                const rate = parseFloat(Math.random().toFixed(4));
                const isActive = Math.random() > 0.3;
                const tags = JSON.stringify([
                    randomItem(['urgent', 'review', 'approved']),
                    randomItem(['backend', 'frontend', 'design'])
                ]);
                const attributes = JSON.stringify([
                    randomItem(attributesOptions),
                    randomItem(attributesOptions),
                    randomItem(attributesOptions),
                    randomItem(attributesOptions),
                ]);
                const level = randomNumber(0, 4);
                const priority = randomNumber(0, 3);
                const code = `PRJ-${randomNumber(1000, 9999)}`;
                const groupId = randomNumber(1, 100);
                const meta = JSON.stringify({
                    source: randomItem(['system', 'user', 'import']),
                    verified: Math.random() > 0.5
                });
                const comment = `Comment ${i + j + 1}`;

                valueRows.push(
                    `('${title.replace(/'/g, "''")}', ` +
                    `'${description}', ` +
                    `'${category}'::jsonb, ` +
                    `'${status}', ` +
                    `${amount}, ` +
                    `${quantity}, ` +
                    `${price}, ` +
                    `${rate}, ` +
                    `${isActive}, ` +
                    `'${tags}'::jsonb, ` +
                    `'${attributes}'::jsonb, ` +
                    `${level}, ` +
                    `${priority}, ` +
                    `'${code}', ` +
                    `${groupId}, ` +
                    `'${meta}'::jsonb, ` +
                    `'${comment}')`
                );
            }

            const query = `
        INSERT INTO records (
          title, description, category, status, amount, quantity, price, rate,
          is_active, tags, attributes, level, priority, code, group_id, meta, comment
        ) VALUES ${valueRows.join(',\n')}
      `;

            await client.query(query);

            const progress = i + batchSize;
            if (progress % 5000 === 0 || progress === TOTAL_RECORDS) {
                console.log(`  ⏳ Progress: ${progress.toLocaleString()} / ${TOTAL_RECORDS.toLocaleString()} records`);
            }
        }

        await client.query('COMMIT');

        const stats = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT category) as categories,
        COUNT(DISTINCT status) as statuses,
        SUM(CASE WHEN is_active THEN 1 ELSE 0 END) as active_records
      FROM records
    `);

        console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Seed completed successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Total Records:     ${parseInt(stats.rows[0].total).toLocaleString()}
📁 Categories:        ${stats.rows[0].categories}
📋 Statuses:          ${stats.rows[0].statuses}
✓  Active Records:    ${parseInt(stats.rows[0].active_records).toLocaleString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Seed failed:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
        process.exit(0);
    }
}

async function waitForPostgres() {
    const maxAttempts = 30;
    let attempt = 0;

    while (attempt < maxAttempts) {
        try {
            await pool.query('SELECT 1');
            console.log('✅ PostgreSQL is ready');
            return true;
        } catch (err) {
            attempt++;
            console.log(`⏳ Waiting for PostgreSQL... (${attempt}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    throw new Error('PostgreSQL connection timeout');
}

waitForPostgres()
    .then(() => seed())
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
