import { Router } from "express";
import { discogsGetJson } from "../lib/discogs";

export const discogsSearchRouter = Router();

function parseDiscogsTitle(raw: string): { title:string; artistName: string | null} {
    const idx = raw.indexOf(" - ");
    if (idx === -1) return { title: raw, artistName: null };
    return {
        artistName: raw.slice(0, idx).trim(),
        title:raw.slice(idx + 3 ).trim(),
    };
}

discogsSearchRouter.get("/release-groups", async (req, res) => {
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (!q) {
        return res.status(400).json({ error: "q is required"});
    }

    try {
        const data = await discogsGetJson<{
            results?: Array<{
                id: number;
                master_id?: number;
                title: string;
                type: string;
                year?: number;
                community?: { want?: number; have?: number };
                cover_image?: string;
        }>;
    }>("/database/search", {
        q,
        type: "naster",
        per_page: 10,
    });

    const items = (data.results ?? [])
        .filter((r) => r.type === "release")
        .map((r) => {
            const { title, artistName } = parseDiscogsTitle(r.title);
            return {
                id: r.id,
                title,
                artistName,
                year: r.year ?? null,
                want: r.community?.want ?? 0,
                have: r.community?.have ?? 0,
                coverUrl: r.cover_image ?? null,
            };
        })
        .sort((a, b) => (b.want + b.have) - (a.want + a.have));

        return res.json({ items });
}catch {
    return res.status(500).json({ error: "discogs search failed" });
}
});