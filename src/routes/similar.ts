import { Router } from "express";
import { getArtistReleaseGroups } from "../lib/musicbrainz";
import { searchReleaseGroups } from "../lib/musicbrainz";

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

similarRouter.get("/from-album", async (req, res) => {
    const album = typeof req.query.album === "string" ? req.query.album : "";
    const artist = typeof req.query.artist === "string" ? req.query.artist : undefined;

    const limitRaw = typeof req.query.limit === "string" ? Number(req.query.limit) : 25;
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 50) : 25;

    if (!album.trim()){
        return res.json({ error: "album is required"});
    }

    try {
        const search = await searchReleaseGroups({ album: album.trim(), artist, limit: 1});
        const seed = search["release-groups"][0];

        if (!seed){
            return res.json({ seed: null, items: [] });
        }

        const seedArtistId = seed["artist-credit"]?.[0]?.artist?.id;
        if (!seedArtistId) {
            return res.json({ seed: { id: seed.id, title: seed.title }, items: [] });
        }

        const sim = await getArtistReleaseGroups({ artistId: seedArtistId, limit });

        const items = sim["release-groups"]
            .filter((rg) => rg.id !== seed.id)
            .map((rg) => ({
                id: rg.id,
                title: rg.title,
                primaryType: rg["primary-type"] ?? null,
                firstReleaseDate: rg["first-release-date"] ?? null,
            }));

        return res.json({
            seed: {
                id: seed.id,
                title: seed.title,
                artistId: seedArtistId,
            },
            items,
        });
    } catch {
        return res.json({ seed:null, items: [], error: "musicbrainz error" });
    }
});