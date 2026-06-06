import { Router } from "express";
import { getArtistReleaseGroups } from "../lib/musicbrainz";
import { searchReleaseGroups } from "../lib/musicbrainz";
import { getReleaseForReleaseGroup } from "../lib/musicbrainz";
import { getCoverArtUrl } from "../lib/coverart";

export const similarRouter = Router();

function isStudioAlbum(rg: {
    "primary-type"?: string| null;
    "secondary-types"?: string[];
    "first-release-date"?: string | null;
}): boolean {
    if (rg["primary-type"] !== "Album") return false;

    const secondary = rg["secondary-types"] ?? [];
    const blocked = new Set([
        "Live",
        "Compilation",
        "Demo",
        "Interview",
        "Mixtape",
        "Soundtrack",
        "Remix",
        "Spokenword",
        "DJ-mix",
    ])

    if (secondary.some((t) => blocked.has(t))) return false;
    if (!rg["first-release-date"]) return false;

    return true;
}

similarRouter.get("/by-artist", async (req, res) => {
    const artistId = typeof req.query.artistId === "string" ? req.query.artistId: "";
    const exclude = typeof req.query.exclude === "string" ? req.query.exclude : undefined;

    const limitRaw = typeof req.query.limit === "string" ? Number(req.query.limit) : 25;
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 50) : 25;

    const albumsOnlyRaw = typeof req.query.albumsOnly === "string" ? req.query.albumsOnly : "1";
    const albumsOnly = albumsOnlyRaw !== "0";

    if (!artistId.trim()){
        return res.json({ error: "artistId is required"});
    }

    try {
        const data = await getArtistReleaseGroups({ artistId: artistId.trim(), limit});
        const items = await Promise.all(
            data["release-groups"]
                .filter((rg) => (exclude ? rg.id !== exclude : true))
                .filter((rg) => (!albumsOnly ? true : isStudioAlbum(rg)))
                .map(async (rg) => {
                    const release = await getReleaseForReleaseGroup({ releaseGroupId: rg.id }).catch(() => null);
                    const coverUrl = release ? await getCoverArtUrl(release.id).catch(() => null) : null;

                    return {
                        id: rg.id,
                        title: rg.title,
                        artistName: rg["artist-credit"]?.[0]?.artist?.name ?? null,
                        primaryType: rg["primary-type"] ?? null,
                        firstReleaseDate: rg["first-release-date"] ?? null,
                        coverUrl,
                    };
                })
        );
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

    const albumsOnlyRaw = typeof req.query.albumsOnly === "string" ? req.query.albumsOnly : "1";
    const albumsOnly = albumsOnlyRaw !== "0";

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

        const items = await Promise.all(
            sim["release-groups"]
                .filter((rg) => rg.id !== seed.id)
                .filter((rg) => (!albumsOnly ? true : isStudioAlbum(rg)))
                .map(async (rg) => {
                    const release = await getReleaseForReleaseGroup({ releaseGroupId: rg.id }).catch(() => null);
                    const coverUrl = release ? await getCoverArtUrl(release.id).catch(() => null) : null;
                    return {
                        id: rg.id,
                        title: rg.title,
                        artistName: rg["artist-credit"]?.[0]?.artist?.name ?? null,
                        primaryType: rg["primary-type"] ?? null,
                        firstReleaseDate: rg["first-release-date"] ?? null,
                        coverUrl,
                    };
                })
        );

        return res.json({
            seed: {
                id: seed.id,
                title: seed.title,
                artistName: seed["artist-credit"]?.[0]?.artist?.name ?? null,
                artistId: seedArtistId,
            },
            items,
        });
    } catch {
        return res.json({ seed:null, items: [], error: "musicbrainz error" });
    }
});