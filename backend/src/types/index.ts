export interface Record {
    id: string;
    title: string;
    description: string;
    category: string;
    status: string;
    amount: number;
    quantity: number;
    price: number;
    rate: number;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    tags: string[];
    attributes: Attribute[];
    level: number;
    priority: number;
    code: string;
    group_id: number;
    lastnames: string;
    firstnames: string;
    meta: {
        source: string;
        verified: boolean;
    };
    comment: string;
}

export interface Attribute {
    key: 'color' | 'size' | 'weight';
    value: string | number;
    type: 'text' | 'number';
}

export interface Column {
    id: string;
    field: keyof Record;
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
    RECORD_UPDATE = 'RECORD_UPDATE',
    RECORD_UPDATED = 'RECORD_UPDATED',
    RECORD_UPDATE_ERROR = 'RECORD_UPDATE_ERROR',
    SUBSCRIBE = 'SUBSCRIBE',
    CONNECTED = 'CONNECTED',
}

export interface WSMessage {
    type: WSMessageType | string;
    payload: any;
}


export interface FieldUpdatePayload {
    recordId: number;
    field: keyof Record;
    value: any;
    userId?: string;
}

export interface RecordUpdatePayload {
    recordId: number;
    updates: Partial<Record>;
    userId?: string;
}