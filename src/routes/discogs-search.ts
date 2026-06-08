import { Router } from "express";
import { discogsGetJson } from "../lib/discogs";

export const discogsSearchRouter = Router();

discogsSearchRouter.get("/release-groups", async (req, res) => {
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (!q) {
        return res.status(400).json({ error: "q is required"});
    }

    try {
        const data = await discogsGetJson<{
            results?: Array<{
                id: number;
                title: string;
                type: string;
                year?: number;
                community?: { want?: number; have?: number };
                cover_image?: string;
        }>;
    }>("/database/search", {
        q,
        type: "release",
        per_page: 10,
    });

    const items = (data.results ?? [])
        .filter((r) => r.type === "release")
        .map((r) => ({
            id: r.id,
            title: r.title,
            year: r.year ?? null,
            want: r.community?.want ?? 0,
            have: r.community?.have ?? 0,
            coverUrl: r.cover_image ?? null,
        }))
        .sort((a, b) => (b.want + b.have) - (a.want + a.have));

        return res.json({ items });
}catch {
    return res.status(500).json({ error: "discogs search failed" });
}
});