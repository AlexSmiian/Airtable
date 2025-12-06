// wsHandlers.ts
import { redisClient } from '../redis/index.ts';
import { RecordService } from '../services/recordService.js';
import { WSMessageType } from '../types/index.js';

const REDIS_CHANNEL = 'table_updates';

export async function handleFieldUpdate(payload: { recordId: number, field: string, value: any }) {
    const { recordId, field, value } = payload;

    // 1️⃣ Оновлюємо БД
    const updatedRecord = await RecordService.updateRecordField(recordId, field, value);

    // 2️⃣ Формуємо повідомлення
    const wsMessage = {
        type: WSMessageType.FIELD_UPDATED,
        payload: { record: updatedRecord, field, value }
    };

    // 3️⃣ Публікуємо у Redis
    await redisClient.publish(REDIS_CHANNEL, JSON.stringify(wsMessage));

    console.log(`📤 Published update to Redis for record ${recordId}`);
    return wsMessage;
}
