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
const fullTags = ['urgent', 'review', 'approved'];
const levels = ['1', '2', '3', '4', '5', '6', '7', '8'];
const attributesOptions = ['size', 'color', 'weight', 'height', 'width', 'depth', 'material', 'brand', 'model', 'capacity', 'power', 'voltage', 'speed', 'temperature', 'length', 'diameter'];
const metaItems = ['system', 'user', 'import']
const activeStatus = ['true', 'false', 'canceled'];

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

            const valueRows = [];
            for (let j = 0; j < batchSize; j++) {
                const firstName = randomItem(firstNames);
                const lastName = randomItem(lastNames);
                const title = `${firstName} ${lastName}`;
                const description = `Project ${i + j + 1}`;
                const category = JSON.stringify(categories);
                const primaryCategory = randomItem(categories);
                const status = JSON.stringify(statuses);
                const primaryStatus = randomItem(statuses);
                const amount = randomNumber(1000, 100000);
                const quantity = randomNumber(1, 500);
                const price = parseFloat((Math.random() * 500).toFixed(2));
                const rate = parseFloat(Math.random().toFixed(4));
                const isActive = JSON.stringify(activeStatus);
                const primaryIsActive = randomItem(activeStatus);
                const tags = JSON.stringify(fullTags);
                const primaryTag = randomItem(fullTags);
                const attributes = JSON.stringify(attributesOptions);
                const primaryAttribute = randomItem(attributesOptions);
                const level = JSON.stringify(levels);
                const primaryLevel = randomNumber(1, 8).toString();
                const priority = JSON.stringify(priorities);
                const primaryPriority = randomItem(priorities);
                const code = `PRJ-${randomNumber(1000, 9999)}`;
                const groupId = randomNumber(1, 100);
                const meta = JSON.stringify(metaItems);
                const primaryMeta = randomItem(metaItems);
                const comment = `Comment ${i + j + 1}`;

                valueRows.push(
                    `('${title.replace(/'/g, "''")}', ` +
                    `'${firstName.replace(/'/g, "''")}', ` +
                    `'${lastName.replace(/'/g, "''")}', ` +
                    `'${description}', ` +
                    `'${category}'::jsonb, ` +
                    `'${primaryCategory}', ` +
                    `'${status}'::jsonb, ` +
                    `'${primaryStatus}', ` +
                    `${amount}, ` +
                    `${quantity}, ` +
                    `${price}, ` +
                    `${rate}, ` +
                    `'${isActive}'::jsonb, ` +
                    `'${primaryIsActive}', ` +
                    `'${tags}'::jsonb, ` +
                    `'${primaryTag}', ` +
                    `'${attributes}'::jsonb, ` +
                    `'${primaryAttribute}', ` +
                    `'${level}'::jsonb, ` +
                    `'${primaryLevel}', ` +
                    `'${priority}'::jsonb, ` +
                    `'${primaryPriority}', ` +
                    `'${code}', ` +
                    `${groupId}, ` +
                    `'${meta}'::jsonb, ` +
                    `'${primaryMeta}', ` +
                    `'${comment}')`
                );
            }

            const query = `
                INSERT INTO records (
                    title, first_names, last_names, description, category, primary_category, status, primary_status,
                    amount, quantity, price, rate, is_active, primary_is_active, tags, primary_tag, attributes, primary_attribute,
                    level, primary_level, priority, primary_priority, code, group_id, meta, primary_meta, comment
                ) VALUES
                    ${valueRows.join(',\n')}
            `;

            await client.query(query);

            const progress = i + batchSize;
            if (progress % 5000 === 0 || progress === TOTAL_RECORDS) {
                console.log(
                    `⏳ Progress: ${progress.toLocaleString()} / ${TOTAL_RECORDS.toLocaleString()} records`
                );
            }
        }

        await client.query('COMMIT');

        const stats = await client.query(`
            SELECT
                COUNT(*) as total,
                COUNT(DISTINCT primary_category) as categories,
                COUNT(DISTINCT primary_status) as statuses
            FROM records
        `);

        console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Seed completed successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Total Records: ${parseInt(stats.rows[0].total).toLocaleString()}
📁 Categories: ${stats.rows[0].categories}
📋 Statuses: ${stats.rows[0].statuses}
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