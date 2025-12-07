import {createClient} from 'redis';
import {REDIS_HOST, REDIS_PORT} from '../config.js';

export const redisClient = createClient({
    socket: {
        host: REDIS_HOST,
        port: REDIS_PORT,
    },
});

export const redisSubscriber = createClient({
    socket: {
        host: REDIS_HOST,
        port: REDIS_PORT,
    },
});

redisClient.on('error', (err: any) => {
    console.error('❌ Redis Client Error:', err);
});

redisSubscriber.on('error', (err: any) => {
    console.error('❌ Redis Subscriber Error:', err);
});

export async function connectRedis() {
    try {
        await redisClient.connect();
        await redisSubscriber.connect();
        console.log('✅ Redis connected successfully');
        return true;
    } catch (err) {
        console.error('❌ Redis connection error:', err);
        return false;
    }
}

export async function disconnectRedis() {
    await redisClient.quit();
    await redisSubscriber.quit();
    console.log('Redis disconnected');
}