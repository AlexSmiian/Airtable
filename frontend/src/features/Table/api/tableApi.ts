import {IRecord} from "@/features/Table/types/table";

export const fetchTableData = async (): Promise<IRecord[]> => {
    // В ідеалі цю логіку варто винести в services/api/tableApi.ts
    const response = await fetch('http://localhost:5000/api/records?limit=100&offset=0&sortBy=id&sortOrder=asc');
    if (!response.ok) {
        // Краще кидати Response, а не Error для більш детальної обробки
        throw new Error('Помилка завантаження даних');
    }

    const json = await response.json();

    return json.data.records;
};