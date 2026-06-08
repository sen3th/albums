import { Router } from "express";
import { discogsGetJson } from "../lib/discogs";

export const discogsSimilarRouter = Router();

discogsSimilarRouter.get("/from-release", async (req, res) => {
    const masterId = typeof req.query.masterId === "string" ? req.query.masterId.trim() : "";
    const artist = typeof req.query.artist === "string" ? req.query.artist.trim() : "";

    if (!masterId || !artist) {
        return res.json({ error: "id or artist is required" });
    }

    try {
        const seed = masterId
        ? await discogsGetJson<any>(`/masters/${masterId}`)
        : null;

        const query = masterId
        ? `${seed?.title ?? ""} ${seed?.genres?.[0] ?? ""} ${seed?.styles?.[0] ?? ""}`.trim()
        : artist;

        const search = await discogsGetJson<{
            results?: Array<any>;
        }>("/database/search", {
            q: query,
            type: "release",
            per_page: 25,
        });

        const seedTitle = String(seed?.title || "").toLowerCase();
        const items = (search.results ?? [])
            .filter((r) => String(r.title || "").toLowerCase() !== seedTitle)
            .map((r) => ({
                id: r.id,
                title: r.title,
                artistName: r.artist ?? null,
                year: r.year ?? null,
                coverUrl: r.cover_image ?? null,
            }))

        return res.json({
            seed: seed
                ? {
                    id:seed.id,
                    title: seed.title,
                    artistName: seed.artisr?.[0]?.name ?? null,
                    maserId: seed.id,
                }
                : null,
            items,
        })
    } catch {
        return res.json({ error: "discogs similar search failed"});
    }
})