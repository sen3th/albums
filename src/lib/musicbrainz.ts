import {config} from "../config";
import {MusicBrainzReleaseGroupSearchResponse} from "../types/musicbrainz"

const BASE_URL = "https://musicbrainz.org/ws/2";

function userAgent(): string {
    const {appName, version, contact} = config.musicbrainz;
    return `${appName}/${version} (${contact})`;
}

export async function mbGetJson<T>(
    path: string,
    query: Record<string, string | number | boolean | undefined> = {}
): Promise<T>{
    const url = new URL(BASE_URL + path);
    for (const [k, v] of Object.entries(query)){
        if (v === undefined) continue;
        url.searchParams.set(k, String(v));
    }

    url.searchParams.set("fmt", "json");

    const res = await fetch(url, {
        headers: {
            "User-Agent": userAgent(),
            "Accept": "application/json"
        },
    });

    if (!res.ok){
        const body = await res.text().catch(()=>"");
        throw new Error(`musicbrainz error ${res.status}: ${body || res.statusText}`);
    }
    return (await res.json()) as T;
}

export async function searchReleaseGroups (params:{
    album: string;
    artist?: string;
    limit?: number;
}): Promise<MusicBrainzReleaseGroupSearchResponse>{
    const {album, artist, limit = 5} = params;
    const qParts = [`releasegroup:"${album}"`];
    if (artist && artist.trim()) qParts.push(`artist:"${artist.trim()}"`);
    
    return mbGetJson<MusicBrainzReleaseGroupSearchResponse>("/release-group", {
        query: qParts.join(" AND "),
        limit,
    });
}

export async function getArtistReleaseGroups(params: {
    artistId: string;
    limit?: number;
}): Promise<MusicBrainzReleaseGroupSearchResponse>{
    const { artistId, limit = 25 } = params;

    return mbGetJson<MusicBrainzReleaseGroupSearchResponse>("/release-group", {
        query: `arid:${artistId}`,
        limit,
    });
}

export async function getReleaseForReleaseGroup(params: {
    releaseGroupId: string;
}): Promise<{ id:string } | null>{
    const {releaseGroupId} = params;
    const data = await mbGetJson<{ releases?: Array<{ id: string }>}>(
        "/release",
        {
            rgid: releaseGroupId,
            limit: 1,
        }
    );
    return data.releases?.[0] ?? null;
}