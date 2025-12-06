import {Router} from "express";
import {RecordController} from "../controllers/recordController.ts";


const router = Router();

router.get('/health', (req, res) => {
    res.json({
        status: 200,
        timestamp: new Date().toISOString(),
        service: 'GuruApps Index API'
    });
});

router.get('/records', RecordController.getRecords);
router.get('/records/:id/field', RecordController.updateField);

export default router;