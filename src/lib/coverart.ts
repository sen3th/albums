const BASE_URL = "https://coverartarchive.org";

export async function getCoverArtUrl(releaseId: string): Promise<string | null> {
    try {
        const res = await fetch(`${BASE_URL}/release/${releaseId}`);
        if (!res.ok) return null;

        const data = await res.json() as {
            images?: Array<{
                front?: boolean;
                image?: string;
                thumbnails?: {
                    small?: string;
                    large?: string;
                };
            }>;
        };

        const front = data.images?.find((img) => img.front && img.image);
        if (front?.image) return front.image;

        const anyImage = data.images?.[0];
        return anyImage?.image ?? anyImage?.thumbnails?.large ?? anyImage?.thumbnails?.small ?? null;
    } catch {
        return null;
    }
}