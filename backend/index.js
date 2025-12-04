import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/hello", (req, res) => {
    res.json({ message: "Hello from backend!" });
});

app.get('/api/privet', (req, res) => {
    res.json({ message: 'Hello from backend Privet' });
});

app.get('/api/www', (req, res) => {
    res.json({ message: 'Hello from backend WWW' });
});

app.listen(5000, () => console.log("Backend running on port 5000"));
