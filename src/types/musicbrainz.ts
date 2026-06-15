export type MusicBrainzArtistCredit = Array<{
    name: string;
    artist: { id: string; name: string;};
}>;

export type MusicBrainzReleaseGroup = {
    id: string;
    title: string;
    "primary-type"?: string;
    "first-release-date"?: string;
    "secondary-types"?: string[];
    "artist-credit"?: MusicBrainzArtistCredit;
    disambiguation?: string | null;
};

export type MusicBrainzReleaseGroupSearchResponse = {
    "release-groups": MusicBrainzReleaseGroup[];
};