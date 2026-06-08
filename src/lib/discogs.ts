const DISCOGS_BASE = "https://api.discogs.com";

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
    headers: {
      "Accept": "application/vnd.discogs.v2+json",
      "User-Agent": "albums/1.0",
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`discogs error ${res.status}: ${body || res.statusText}`);
  }

  return (await res.json()) as T;
}