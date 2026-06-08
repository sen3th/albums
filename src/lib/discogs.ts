const DISCOGS_BASE = "https://api.discogs.com";

function discogsHeaders() {
    const token = process.env.DISCOGS_TOKEN;
    return {
        "Accept": "application/vnd.discogs.v2+json",
        "user-agent": "albums/1.0",
        ...(token ? { "Authorization": `Discogs token=${token}` } : {}),
    };
} 

export async function discogsGetJson<T>(
  path: string,
  query: Record<string, string | number | undefined> = {}
): Promise<T> {
  const url = new URL(DISCOGS_BASE + path);
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined) continue;
    url.searchParams.set(k, String(v));
  }

  const res = await fetch(url.toString(), {
    headers: discogsHeaders(),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`discogs error ${res.status}: ${body || res.statusText}`);
  }

  return (await res.json()) as T;
}