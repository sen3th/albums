import { Router } from "express";
import { searchReleaseGroups } from "../lib/musicbrainz";
import { getSimilarAlbums } from "../lib/lastfm";

export const similarRouter = Router();

similarRouter.get("/from-album", async (req, res) => {
    const album = typeof req.query.album === "string" ? req.query.album : "";
    const artist = typeof req.query.artist === "string" ? req.query.artist : "";

    if (!album.trim()) {
        return res.json({ error: "album is required" });
    }

    try {
        const search = await searchReleaseGroups({ album: album.trim(), artist: artist.trim() || undefined, limit: 1 });
        const seed = search["release-groups"][0];

        const seedTitle = seed?.title ?? album.trim();
        const seedArtist = seed?.["artist-credit"]?.[0]?.artist?.name ?? artist.trim();

        if (!seedArtist) {
            return res.json({ seed: null, items: [], error: "couldn't resolve artist" });
        }

        const items = await getSimilarAlbums(seedArtist, seedTitle);

        return res.json({
            seed: seed ?{
                id: seed.id,
                title: seed.title,
                artistName: seedArtist,
            } : null,
            items,
        });
    } catch (e){
        return res.json({ seed: null, items: [], error: "search failed" });
    }
});