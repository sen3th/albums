import { Router } from "express";
import { discogsGetJson } from "../lib/discogs";

export const discogsReleaseRouter = Router();

discogsReleaseRouter.get("/:id", async (req, res) => {
    const id = req.params.id;
    if (!id) return res.json({ error: "id's required"});

    try {
        const data = await discogsGetJson<any>(`/releases/${id}`);
        return res.json({
            id: data.id,
            title: data.title,
            artistName: data.artists?.[0]?.name ?? null,
            year: data.year ?? null,
            genres: data.genres ?? [],
            styles: data.styles ?? [],
            masterId: data.master_id ?? null,
            trackCount: data.tracklist?.length ?? null,
        })
    } catch {
        return res.json({ error: "failed discogs release search"});
    }
});