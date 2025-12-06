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
            {id: 'priority', field: 'priority', name: 'Priority', type: 'number', editable: true},
            {id: 'code', field: 'code', name: 'Code', type: 'text', editable: true},
            {id: 'group_id', field: 'group_id', name: 'Group', type: 'number', editable: true},
            {id: 'comment', field: 'comment', name: 'Comment', type: 'text', editable: true},
        ];
    }

    static async getRecords(params: PaginationParams): Promise<{ records: Record[], total: number }> {
        const { limit, offset, sortBy = "id", sortOrder = 'asc' } = params;

        const allowedSortFiels = ['id', 'title', 'created_at', 'updated_at', 'amount', 'price'];
        const safeSortBy = allowedSortFiels.includes(sortBy) ? sortBy : 'id';
        const safeSortOrder = sortOrder === 'desc' ? 'DESC' : 'ASC';

        const  [recordsResult, countResult] = await Promise.all([
            pool.query(
                `SELECT * FROM records ORDER BY ${safeSortBy} ${safeSortOrder} LIMIT $1 OFFSET $2`,
                [limit, offset],
            ),
            pool.query('SELECT COUNT(*) FROM records')
        ]);

        return {
            records: recordsResult.rows,
            total: parseInt(countResult.rows[0].count)
        }
    };

    static async updateRecordField(recordId: number, field: string, value: any): Promise<Record> {
        const allowedFields = ['title', 'description', 'category', 'status', 'amount', 'quantity', 'price', 'rate', 'is_active', 'level', 'priority', 'code', 'group_id', 'comment'];

        if(!allowedFields.includes(field)) {
            throw  new Error(`Field ${field} is not allowed to be updated`);
        }

        const result = await pool.query(
            `UPDATE records SET ${field} = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
            [value,recordId]
        );

        if (result.rows.length === 0) {
            throw new Error('Record not found');
        }

        return result.rows[0];
    }
}