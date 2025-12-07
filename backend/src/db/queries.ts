import {Column, PaginationParams, Record} from "../types/index.ts";
import {pool} from "./pool.ts";

export class RecordQueries {
    static getColums(): Column[] {
        return [
            {id: 'id', field: 'id', name: 'ID', type: 'number', editable: false},
            {id: 'title', field: 'title', name: 'Title', type: 'text', editable: true},
            {id: 'description', field: 'description', name: 'Description', type: 'text', editable: true},
            {id: 'group_id', field: 'group_id', name: 'Group', type: 'number', editable: true},
            {id: 'comment', field: 'comment', name: 'Comment', type: 'text', editable: true},
            {id: 'created_at', field: 'created_at', name: 'Create Date', type: 'date', editable: true},
            {id: 'updated_at', field: 'updated_at', name: 'Update Date', type: 'date', editable: true},
            {id: 'amount', field: 'amount', name: 'Amount', type: 'number', editable: true},
            {id: 'quantity', field: 'quantity', name: 'Quantity', type: 'number', editable: true},
            {id: 'price', field: 'price', name: 'Price', type: 'number', editable: true},
            {id: 'rate', field: 'rate', name: 'Rate', type: 'number', editable: true},
            {id: 'code', field: 'code', name: 'Code', type: 'text', editable: true},
            {
                id: 'category_list',
                field: 'category',
                name: 'Category (List)',
                type: 'json',
                editable: false,
            },
            {
                id: 'tags_list',
                field: 'tags',
                name: 'Tags (List)',
                type: 'json',
                editable: false,
            },
            {
                id: 'primary_tag',
                field: 'primary_tag',
                name: 'Primary Tag',
                type: 'select',
                editable: true,
                options: ['urgent', 'review', 'approved']
            },
            {
                id: 'primary_category',
                field: 'primary_category',
                name: 'Category',
                type: 'select',
                editable: true,
                options: ['Marketing', 'Sales', 'Development', 'Design', 'Support']
            },
            {
                id: 'status_list',
                field: 'status',
                name: 'Status (List)',
                type: 'json',
                editable: false,
            },
            {
                id: 'primary_status',
                field: 'primary_status',
                name: 'Status',
                type: 'select',
                editable: true,
                options: ['Active', 'Pending', 'Completed', 'Cancelled', 'On Hold']
            },
            {
                id: 'is_active_list',
                field: 'is_active',
                name: 'Active (List)',
                type: 'json',
                editable: false,
            },
            {
                id: 'primary_is_active',
                field: 'primary_is_active',
                name: 'Active',
                type: 'select',
                editable: true,
                options: ['true', 'false', 'canceled']
            },
            {
                id: 'level_list',
                field: 'level',
                name: 'Level (List)',
                type: 'json',
                editable: false,
            },
            {
                id: 'primary_level',
                field: 'primary_level',
                name: 'Level',
                type: 'select',
                editable: true,
                options: ['1', '2', '3', '4', '5', '6', '7', '8']
            },
            {
                id: 'priority_list',
                field: 'priority',
                name: 'Priority (List)',
                type: 'json',
                editable: false,
            },
            {
                id: 'primary_priority',
                field: 'primary_priority',
                name: 'Priority',
                type: 'select',
                editable: true,
                options: ['Low', 'Medium', 'High', 'Critical']
            },
            {
                id: 'attributes_list',
                field: 'attributes',
                name: 'Attributes (List)',
                type: 'json',
                editable: false,
            },
            {
                id: 'primary_attribute',
                field: 'primary_attribute',
                name: 'Attribute',
                type: 'select',
                editable: true,
                options: ['size', 'color', 'weight', 'height', 'width', 'depth', 'material', 'brand', 'model', 'capacity', 'power', 'voltage', 'speed', 'temperature', 'length', 'diameter']
            },
            {
                id: 'last_names',
                field: 'last_names',
                name: 'Last Names',
                type: 'text',
                editable: true,
            },
            {
                id: 'first_names',
                field: 'first_names',
                name: 'First Names',
                type: 'text',
                editable: true,
            },
            {
                id: 'meta_list',
                field: 'meta',
                name: 'Meta (List)',
                type: 'json',
                editable: false,
            },
            {
                id: 'primary_meta',
                field: 'primary_meta',
                name: 'Meta',
                type: 'select',
                editable: true,
                options: ['system', 'user', 'import']
            },
        ];
    }

    private static getAllFields(): string[] {
        const uniqueFields = Array.from(new Set(this.getColums().map(col => col.field)));
        return uniqueFields;
    }

    private static getSortableFields(): string[] {
        const columns = this.getColums();
        return columns
            .filter(col => col.type === 'number' || col.type === 'text' || col.type === 'date')
            .map(col => col.field);
    }

    static async getRecords(params: PaginationParams): Promise<{ records: Record[], total: number }> {
        const {limit, offset, sortBy = "id", sortOrder = 'asc'} = params;

        const allFields = this.getAllFields();
        const selectFields = allFields.join(', ');

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

    private static getEditableFields(): string[] {
        return this.getColums()
            .filter(col => col.editable)
            .map(col => col.field);
    }

    static async updateRecordField(recordId: number, field: string, value: any): Promise<Record> {
        const allowedFields = this.getEditableFields();

        if (!allowedFields.includes(field)) {
            throw new Error(`Field ${field} is not allowed to be updated`);
        }

        const columns = this.getColums();
        const columnConfig = columns.find(col => col.field === field);

        let queryValue = value;

        if (columnConfig?.type === 'json' && typeof value === 'object' && value !== null) {
            queryValue = JSON.stringify(value);
        }

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

}