import "dotenv/config";
import express from "express";
import {config} from "./config";
import { searchRouter } from "./routes/search";
import { similarRouter } from "./routes/similar";
import cors from "cors";
import { discogsSearchRouter } from "./routes/discogs-search";
import { discogsSimilarRouter } from "./routes/discogs-similar";

const app = express();
app.use(express.json());
app.use(cors());

app.get("/health", (_req, res) =>{
    res.json({ ok: true});
});

app.use("/api/search", searchRouter);
app.use("/api/similar", similarRouter);

app.listen(config.port, "0.0.0.0", ()=>{
    console.log(`runing on http://localhost:${config.port}`);
});

app.use("/api/discogs", discogsSearchRouter);
app.use("/api/discogs", discogsSimilarRouter);