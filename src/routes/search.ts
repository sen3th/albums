import {Router} from 'express';
import {searchReleaseGroups} from "../lib/musicbrainz";

export const searchRouter = Router();

searchRouter.get("/release-groups", async (req, res) =>{
    const album = typeof req.query.album === "string" ? req.query.animal : "";
    const artist = typeof req.query.artist === "string" ? req.query.artist : undefined;

    const limitRaw = typeof req.query.limit === "string" ? Number(req.query.limit) : 5;
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 10): 5;

    if (!album.trim()){
        return res.status(400).json({error: "need a query parameter 'album'"});
    }
    const data = await searchReleaseGroups({album: album.trim(), artist, limit})})

    const items = data["release-groups"].map((rg)=>({
        id: rg.id,
        title: rg.title,
        primaryType: rg["primary-type"] ?? null,
        artistCredit:
            rg["artist-credit"]?.map((ac) => ({
                name: ac.name,
                artist: {id: ac.artist.id, name: ac.artist.name},
            })) ?? [],
            }))
    }));

    return res.json({items});
});