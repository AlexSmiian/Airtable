import { Request, Response } from 'express';
import {RecordService} from "../services/recordService.ts";

export class RecordController {
    static async getRecords(req: Request, res: Response) {
        try {
            const limit = parseInt(req.query.limit as string) || 100;
            const offset = parseInt(req.query.offset as string) || 0;
            const sortBy= (req.query.sortBy as string) || 'id';
            const sortOrder = (req.query.sortOrder as "asc" | "desc") || 'asc';

            const data = await RecordService.getTableData(limit, offset, sortBy, sortOrder);

            res.json({
                success: true,
                data,
                pagination: {
                    limit,
                    offset,
                    total: data.total,
                    hasMore: offset + limit < data.total
                }
            });
        }catch (error) {
            console.error('Error fetching records:', error);
            res.status(500).json({
                success: false,
                error: error,
            })
        }
    }

    static async updateField( req: Request, res: Response ) {
        try {
            const recordId = parseInt(req.params.id);
            const { field, value } = req.body;

            if(isNaN(recordId)){
                return res.status(400).json({
                    success: false,
                    error: "Bad Request.Invalid record ID",
                });
            }

            if(!field) {
                return res.status(400).json({
                    success: false,
                    error: "Bad Request.Field name is required",
                })
            }

            const updateRecord = await RecordService.updateRecordField(recordId, field, value);

            res.json({
                success: true,
                data: updateRecord,
            });
        }catch (error) {
            console.error('Error updating record field:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update record field'
            });
        }
    }
}