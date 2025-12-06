export type IRecord = {
    id: number;
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
    attributes: string[];
    level: number;
    priority: number;
    code: string;
    group_id: number;
    firstnames: string;
    lastnames: string;
    meta: {
        source: string;
        verified: boolean;
    };
    comment: string;
}