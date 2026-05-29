import { Router } from "express";
import { getArtistReleaseGroups } from "../lib/musicbrainz";

export const similarRouter = Router();

similarRouter.get("/by-artist", async (req, res) => {
    const artistId = typeof req.query.artistId === "string" ? req.query.artistId: "";
    const exclude = typeof req.query.exclude === "string" ? req.query.exclude : undefined;

    const limitRaw = typeof req.query.limit === "string" ? Number(req.query.limit) : 25;
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 50) : 25;

    if (!artistId.trim()){
        return res.json({ error: "artistId is required"});
    }

    try {
        const data = await getArtistReleaseGroups({ artistId: artistId.trim(), limit});
        const items = data["release-groups"]
            .filter((rg) => (exclude ? rg.id !== exclude : true))
            .map((rg)=>({
                id: rg.id,
                title: rg.title,
                primaryType: rg["primary-type"] ?? null,
                firstReleaseDate: rg["first-release-date"] ?? null,
            }));
            return res.json({ items });

    } catch {
        return res.json({ items: [], error: "musicbrainz error"});
    }
});