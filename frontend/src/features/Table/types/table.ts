export type IRecord = {
    id: number;
    title: string;
    description: string;
    category: string[];
    primary_category: string;
    status: string;
    amount: number;
    quantity: number;
    price: number;
    rate: number;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    attributes: string[];
    primary_attribute: string | null;
    level: number;
    priority: number;
    code: string;
    group_id: number;
    firstnames: string;
    lastnames: string;
    tags: string[];
    primary_tag: string | null;
    meta: {
        source: string;
        verified: boolean;
    };
    comment: string;
}