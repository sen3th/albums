const BASE_URL = "https://ws.audioscrobbler.com/2.0";

function apiKey(): string {
    const key = process.env.LASTFM_API_KEY;
    if (!key) throw new Error("missing last api");
    return key;
}

export async function lastfmGetJson<T>(
    params: Record<string, string | number>
): Promise<T> {
    const url = new URL(BASE_URL);
    url.searchParams.set("api_key", apiKey());
    url.searchParams.set("format", "json");
    for (const [k, v] of Object.entries(params)) {
        url.searchParams.set(k, String(v));
    }

    const res = await fetch(url.toString(), {
        headers: { "Accept": "application/json" },
    });

    if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`lastfm error ${res.status}: ${body}`);
    }

    return (await res.json()) as T;
}

export async function getSimilarAlbums(artist: string, album: string, limit = 20): Promise<Array<{
    title: string;
    artistName: string;
    coverUrl: string | null;
}>> {
    const data = await lastfmGetJson<{
        similarartists?: {
            artist?: Array<{
                name: string;
                image?: Array<{ "#text": string; size: string }>;
            }>;
        };
        error?: number;
        message?: string;
    }>({
        method: "artist.getSimilar",
        artist,
        limit: limit * 2,
    });

    if (data.error || !data.similarartists?.artist?.length) {
        return [];
    }

    const similarArtists = (data.similarartists.artist ?? []).slice(0, 8);

    const results = await Promise.all(
        similarArtists.map(async (a) => {
            try {
                const topAlbums = await lastfmGetJson<{
                    topalbums?: {
                        album?: Array<{
                            name: string;
                            image?: Array<{ "#text": string; size: string }>;
                        }>;
                    };
                }>({
                    method: "artist.getTopAlbums",
                    artist: a.name,
                    limit: 3,
                });

                const albums = topAlbums.topalbums?.album ?? [];
                return albums
                    .filter((al) => al.name !== "(null)" && al.name !== "")
                    .map((al) => {
                        const img = (al.image ?? []).find((i) => i.size === "extralarge") ??
                                    (al.image ?? []).find((i) => i.size === "large");
                        return {
                            title: al.name,
                            artistName: a.name,
                            coverUrl: img?.["#text"] || null,
                        };
                    });
            } catch {
                return [];
            }
        })
    );

    return results.flat().filter((r) => r.coverUrl && !r.coverUrl.includes("2a96cbd8b46e442fc41c2b86b821562f"));
}