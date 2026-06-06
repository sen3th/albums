const BASE_URL = "https://coverartarchive.org";

export async function getCoverArtUrl(releaseId: string): Promise<string | null>{
    try {
        const res = await fetch(`${BASE_URL}/release/${releaseId}`);
        if (!res.ok) return null;

        return `${BASE_URL}/release/${releaseId}/front`;
    } catch {
        return null;
    }
}