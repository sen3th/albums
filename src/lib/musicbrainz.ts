import {config} from "../config";

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