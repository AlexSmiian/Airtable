import express, {Application} from "express";
import cors from "cors";
import routes from "./routes/index.js";

const app: Application = express();

//Middleware

app.use(cors());
app.use(express.json());

app.use('/api',routes);


app.use((err: any, req: any, res: any, next: any) => {
    console.error(err);
    res.status(500).json({ error: err.message || 'Server error' });
});

export default app;