function requiredEnv(name: string): string {
    const v = process.env[name];
    if (!v) throw new Error(`missing env ${name}`);
    return v;
}

export const config = {
    port: process.env.PORT ? Number(process.env.PORT) : 3000,
    musicbrainz: {
        appName: requiredEnv("MB_APP_NAME"),
        contact: requiredEnv("MB_CONTACT"),
        version: process.env.MB_VERSION ?? "0.0.0",
    },
};