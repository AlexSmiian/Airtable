import {Column, PaginationParams, Record} from "../types/index.ts";
import {pool} from "./pool.ts";

export class RecordQueries {
    static getColums(): Column[] {
        return [
            {id: 'id', field: 'id', name: 'ID', type: 'number', editable: false},
            {id: 'title', field: 'title', name: 'Title', type: 'text', editable: true},
            {id: 'description', field: 'description', name: 'Description', type: 'text', editable: true},
            {
                id: 'category',
                field: 'category',
                name: 'Category',
                type: 'select',
                editable: true,
                options: ['Marketing', 'Sales', 'Development', 'Design', 'Support']
            },
            {
                id: 'status',
                field: 'status',
                name: 'Status',
                type: 'select',
                editable: true,
                options: ['Active', 'Pending', 'Completed', 'Cancelled', 'On Hold']
            },
            {id: 'amount', field: 'amount', name: 'Amount', type: 'number', editable: true},
            {id: 'quantity', field: 'quantity', name: 'Quantity', type: 'number', editable: true},
            {id: 'price', field: 'price', name: 'Price', type: 'number', editable: true},
            {id: 'rate', field: 'rate', name: 'Rate', type: 'number', editable: true},
            {id: 'is_active', field: 'is_active', name: 'Active', type: 'boolean', editable: true},
            {id: 'level', field: 'level', name: 'Level', type: 'number', editable: true},
            {id: 'priority', field: 'priority', name: 'Priority', type: 'select', editable: true},
            {id: 'code', field: 'code', name: 'Code', type: 'text', editable: true},
            {
                id: 'attributes',
                field: 'attributes',
                name: 'Attributes',
                type: 'select',
                editable: true,
                options: ['size', 'color', 'weight', 'height', 'width', 'depth', 'material', 'brand', 'model', 'capacity', 'power', 'voltage', 'speed', 'temperature', 'length', 'diameter']
            },
            {
                id: 'lastnames',
                field: 'lastnames',
                name: 'Last Names',
                type: 'text',
                editable: true,
            },
            {
                id: 'firstnames',
                field: 'firstnames',
                name: 'First Names',
                type: 'text',
                editable: true,
            },
            {id: 'group_id', field: 'group_id', name: 'Group', type: 'number', editable: true},
            {id: 'comment', field: 'comment', name: 'Comment', type: 'text', editable: true},
            {id: 'created_at', field: 'created_at', name: 'Create Date', type: 'date', editable: true},
            {id: 'updated_at', field: 'updated_at', name: 'Update Date', type: 'date', editable: true},
            {id: 'meta', field: 'meta', name: 'Meta', type: 'json', editable: true},
        ];
    }

    // Отримуємо список всіх полів з колонок
    private static getAllFields(): string[] {
        return this.getColums().map(col => col.field);
    }

    // Отримуємо список полів, які можна сортувати
    private static getSortableFields(): string[] {
        const columns = this.getColums();
        return columns
            .filter(col => col.type === 'number' || col.type === 'text' || col.type === 'date')
            .map(col => col.field);
    }

    static async getRecords(params: PaginationParams): Promise<{ records: Record[], total: number }> {
        const {limit, offset, sortBy = "id", sortOrder = 'asc'} = params;

        // Динамічно отримуємо список полів для SELECT з getColumns()
        const allFields = this.getAllFields();
        const selectFields = allFields.join(', ');

        // Динамічно отримуємо дозволені поля для сортування
        const allowedSortFields = this.getSortableFields();
        const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'id';
        const safeSortOrder = sortOrder === 'desc' ? 'DESC' : 'ASC';

        const [recordsResult, countResult] = await Promise.all([
            pool.query(
                `SELECT ${selectFields}
                 FROM records
                 ORDER BY ${safeSortBy} ${safeSortOrder} 
                 LIMIT $1 OFFSET $2`,
                [limit, offset],
            ),
            pool.query('SELECT COUNT(*) FROM records')
        ]);

        return {
            records: recordsResult.rows,
            total: parseInt(countResult.rows[0].count)
        }
    }

    // Отримуємо список полів, які можна редагувати
    private static getEditableFields(): string[] {
        return this.getColums()
            .filter(col => col.editable)
            .map(col => col.field);
    }

    static async updateRecordField(recordId: number, field: string, value: any): Promise<Record> {
        // Динамічно отримуємо дозволені поля для оновлення
        const allowedFields = this.getEditableFields();

        if (!allowedFields.includes(field)) {
            throw new Error(`Field ${field} is not allowed to be updated`);
        }

        // Для JSONB полів використовуємо спеціальний синтаксис
        const columns = this.getColums();
        const columnConfig = columns.find(col => col.field === field);

        let queryValue = value;
        if (columnConfig?.type === 'json' && typeof value === 'object') {
            queryValue = JSON.stringify(value);
        }

        // Динамічно отримуємо всі поля для RETURNING
        const allFields = this.getAllFields();
        const selectFields = allFields.join(', ');

        const result = await pool.query(
            `UPDATE records
             SET ${field} = $1,
                 updated_at = NOW()
             WHERE id = $2 
             RETURNING ${selectFields}`,
            [queryValue, recordId]
        );

        if (result.rows.length === 0) {
            throw new Error('Record not found');
        }

        return result.rows[0];
    }

    // Додатковий метод для отримання одного запису з усіма полями
    static async getRecordById(recordId: number): Promise<Record | null> {
        const allFields = this.getAllFields();
        const selectFields = allFields.join(', ');

        const result = await pool.query(
            `SELECT ${selectFields}
             FROM records
             WHERE id = $1`,
            [recordId]
        );

        return result.rows.length > 0 ? result.rows[0] : null;
    }

    // Метод для валідації даних перед вставкою/оновленням
    static validateFieldValue(field: string, value: any): { valid: boolean; error?: string } {
        const columns = this.getColums();
        const columnConfig = columns.find(col => col.field === field);

        if (!columnConfig) {
            return { valid: false, error: `Field ${field} does not exist` };
        }

        // Перевірка типу
        switch (columnConfig.type) {
            case 'number':
                if (typeof value !== 'number' && isNaN(Number(value))) {
                    return { valid: false, error: `${field} must be a number` };
                }
                break;
            case 'boolean':
                if (typeof value !== 'boolean') {
                    return { valid: false, error: `${field} must be a boolean` };
                }
                break;
            case 'select':
                if (columnConfig.options && !columnConfig.options.includes(value)) {
                    return {
                        valid: false,
                        error: `${field} must be one of: ${columnConfig.options.join(', ')}`
                    };
                }
                break;
        }

        return { valid: true };
    }
}