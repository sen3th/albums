import "dotenv/config";
import express from "express";
import {config} from "./config";
import { searchRouter } from "./routes/search";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) =>{
    res.json({ ok: true});
});

app.use("/search", searchRouter);

app.listen(config.port, ()=>{
    console.log(`runing on https://localhost:${config.port}`);
});