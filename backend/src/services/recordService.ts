import {PaginationParams, TableDataResponse, Record} from "../types/index.ts";
import {RecordQueries} from "../db/queries.ts";


export class RecordService {
    static async getTableData(
        limit: number = 100,
        offset: number = 0,
        sortBy?: string,
        sortOrder?: 'asc' | 'desc'
    ): Promise<TableDataResponse> {
        const params: PaginationParams = {limit, offset, sortBy, sortOrder};
        const {records, total} = await RecordQueries.getRecords(params);
        const columns = RecordQueries.getColums();

        return {records, total, columns}
    }

    static async updateRecordField(recordId: number, field: string, value: any): Promise<Record> {
        return await RecordQueries.updateRecordField(recordId, field, value);
    }
}