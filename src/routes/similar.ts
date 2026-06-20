import { Router } from "express";
import { searchReleaseGroups } from "../lib/musicbrainz";
import { getSimilarAlbums } from "../lib/lastfm";
import { lastfmGetJson } from "../lib/lastfm";

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

        let seedCoverUrl: string | null = null;
        try{
            const info = await lastfmGetJson<{
                album?: {
                    image?: Array<{ "#text": string; size: string }>;
                };
            }>({
                method: "album.getInfo",
                artist: seedArtist,
                album: seedTitle,
            });
            const img = (info.album?.image ?? []).find((i) => i.size === "extralarge") ??
                        (info.album?.image ?? []).find((i) => i.size === "large");
            seedCoverUrl = img?.["#text"] || null;
            if (seedCoverUrl?.includes("2a96cbd8b46e442fc41c2b86b821562f")) seedCoverUrl = null;
        } catch{
            seedCoverUrl = null;
        }

        const items = await getSimilarAlbums(seedArtist, seedTitle);

        return res.json({
            seed: {
                title: seed.title,
                artistName: seedArtist,
                coverUrl: seedCoverUrl,
            },
            items,
        });
    } catch{
        return res.json({ seed: null, items: [], error: "search failed" });
    }
});