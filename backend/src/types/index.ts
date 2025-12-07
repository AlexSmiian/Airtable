export interface Attribute {
    key: 'color' | 'size' | 'weight';
    value: string | number;
    type: 'text' | 'number';
}

export interface Record {
    id: string;
    title: string;
    description: string;
    category: string[];
    primary_category: string | null;
    status: string[];
    primary_status: string | null;
    amount: number;
    quantity: number;
    price: number;
    rate: number;
    is_active: string[];
    primary_is_active: string | null;
    created_at: Date;
    updated_at: Date;
    tags: string[];
    primary_tag: string | null;
    attributes: Attribute[];
    primary_attribute: string | null;
    level: string[];
    primary_level: string | null;
    priority: string[];
    primary_priority: string | null;
    code: string;
    group_id: number;
    last_names: string;
    first_names: string;
    meta: string[];
    primary_meta: string | null;
    comment: string;
}

export type RecordKeys = keyof Record;

export interface Column {
    id: string;
    field: RecordKeys;
    name: string;
    type: ColumnType;
    editable: boolean;
    options?: string[];
}

export type ColumnType = "text" | "number" | 'select' | 'boolean' | 'date' | 'json';


export interface TableDataResponse {
    records: Record[];
    total: number;
    columns: Column[];
}

export interface PaginationParams {
    limit: number;
    offset: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export enum WSMessageType {
    FIELD_UPDATE = 'FIELD_UPDATE',
    FIELD_UPDATED = 'FIELD_UPDATED',
    RECORD_UPDATE_ERROR = 'RECORD_UPDATE_ERROR',
}
