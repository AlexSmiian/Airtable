import { IRecord } from "@/features/Table/types/table";

export const fetchTableData = async (offset : number, limit: number): Promise<IRecord[]> => {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_ORIGIN}/api/records?limit=${limit}&offset=${offset}&sortBy=id&sortOrder=asc`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Помилка завантаження даних: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();

    return json.data.records;
};