const BASE_URL = "https://coverartarchive.org";

export async function getCoverArtUrl(releaseId: string): Promise<string | null> {
    try {
        const res = await fetch(`${BASE_URL}/release/${releaseId}`, {
            redirect: "follow",
            headers: { "Accept": "application/json" },
        });
        if (!res.ok) return null;

        const data = await res.json() as {
            images?: Array<{
                front?: boolean;
                image?: string;
                thumbnails?: { small?: string; large?: string; "500"?: string; "250"?: string };
            }>;
        };

        const front = data.images?.find((img) => img.front);
        const pick = front ?? data.images?.[0];
        if (!pick) return null;

        return (
            pick.thumbnails?.["250"] ??
            pick.thumbnails?.small ??
            pick.thumbnails?.large ??
            pick.image ??
            null
        );
    } catch {
        return null;
    }
}