import "dotenv/config";
import express from "express";
import {config} from "./config";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) =>{
    res.json({ ok: true});
});

app.listen(config.port, ()=>{
    console.log(`runing on https://localhost:${config.port}`);
});