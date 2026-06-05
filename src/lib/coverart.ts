const BASE_URL = "https://coverartarchive.org";

export async function getCoverArtUrl(releaseId: string): Promise<string | null>{
    try {
        const res = await fetch(`${BASE_URL}/release/${releaseId}`);
        if (!res.ok) return null;

        const data = await res.json() as {
            images?: Array<{
                front?: boolean;
                image?: string;
            }>;
        };
        const front = data.images?.find((img) => img.front && img.image);
        return front?.image ?? null;
    } catch {
        return null;
    }
}