import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    user: 'postgres',
    host: 'db',
    database: 'airtable',
    password: 'postgres',
    port: 5432,
});

const BATCH_SIZE = 500;
const TOTAL_RECORDS = 51000;

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateRecord() {
    return {
        title: Math.random().toString(36).substring(2, 12),
        description: Math.random().toString(36).substring(2, 20),
        category: getRandomElement(['finance','education','marketing','games','health','travel']),
        status: getRandomElement(['active','inactive','pending']),
        amount: Math.floor(Math.random() * 10000),
        quantity: Math.floor(Math.random() * 500),
        price: (Math.random() * 500).toFixed(2),
        rate: Math.random(),
        is_active: Math.random() > 0.5,
        created_at: new Date(new Date().getTime() - Math.random() * 100 * 24*60*60*1000),
        updated_at: new Date(new Date().getTime() - Math.random() * 50 * 24*60*60*1000),
        tags: JSON.stringify([
            Math.random().toString(36).substring(2, 8),
            Math.random().toString(36).substring(2, 8),
            Math.random().toString(36).substring(2, 8)
        ]),
        attributes: JSON.stringify({
            color: getRandomElement(['red','green','blue','black','white']),
            size: Math.floor(Math.random() * 50),
            weight: +(Math.random() * 10).toFixed(2)
        }),
        level: Math.floor(Math.random() * 5),
        priority: Math.floor(Math.random() * 3), // замість 'low/medium/high', використовується int
        code: Math.random().toString(36).substring(2, 12),
        group_id: Math.floor(Math.random() * 1000),
        meta: JSON.stringify({
            source: getRandomElement(['system','user','import']),
            verified: Math.random() > 0.5
        }),
        comment: Math.random().toString(36).substring(2, 15)
    };
}

async function waitForPostgres() {
    while (true) {
        try {
            await pool.query('SELECT 1');
            console.log('Postgres is ready!');
            break;
        } catch {
            console.log('Waiting for Postgres...');
            await new Promise(r => setTimeout(r, 1000));
        }
    }
}

async function seed() {
    await waitForPostgres();

    for (let i = 0; i < TOTAL_RECORDS; i += BATCH_SIZE) {
        const records = Array.from({ length: BATCH_SIZE }, generateRecord);

        const values = [];
        const placeholders = records.map((r, idx) => {
            const offset = idx * 19; // кількість колонок
            values.push(
                r.title,
                r.description,
                r.category,
                r.status,
                r.amount,
                r.quantity,
                r.price,
                r.rate,
                r.is_active,
                r.created_at,
                r.updated_at,
                r.tags,        // JSON рядок
                r.attributes,  // JSON рядок
                r.level,
                r.priority,
                r.code,
                r.group_id,
                r.meta,        // JSON рядок
                r.comment
            );
            const params = Array.from({ length: 19 }, (_, j) => `$${offset + j + 1}`);
            return `(${params.join(',')})`;
        });

        const query = `
            INSERT INTO records (
                title, description, category, status, amount, quantity, price, rate,
                is_active, created_at, updated_at, tags, attributes, level, priority,
                code, group_id, meta, comment
            ) VALUES ${placeholders.join(',')}
        `;

        await pool.query(query, values);
        console.log(`Inserted ${Math.min(i + BATCH_SIZE, TOTAL_RECORDS)} / ${TOTAL_RECORDS}`);
    }

    await pool.end();
    console.log('Seeding completed!');
}

seed().catch(err => console.error(err));
