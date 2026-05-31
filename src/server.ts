import "dotenv/config";
import express from "express";
import {config} from "./config";
import { searchRouter } from "./routes/search";
import { similarRouter } from "./routes/similar";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

app.get("/health", (_req, res) =>{
    res.json({ ok: true});
});

app.use("/api/search", searchRouter);
app.use("/api/similar", similarRouter);

app.listen(config.port, ()=>{
    console.log(`runing on http://localhost:${config.port}`);
});