const API_BASE = "https://albums-ueia.onrender.com";

const form = document.querySelector("#form");
const statusEl = document.querySelector("#status");
const seedEl = document.querySelector("#seed");
const resultsEl = document.querySelector("#results");

function setStatus(text){
    statusEl.textContent = text || "";
}

function renderSeed(seed){
    if (!seed){
        seedEl.textContent = "-";
        return;
    }
    const title = seed.title || "unknown album";
    const artist = seed.artistName || "Unknown artist";

    seedEl.innerHTML = `
        <div class="seed-title">${title}</div>
        <div class="seed-artist">${artist}</div>
        `;
}

function escapeHtml(text){
    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function renderResults(items){
    resultsEl.innerHTML = "";
    for (const it of items){
        const li = document.createElement("li");
        li.className = "album-card";

        li.innerHTML = `
        <div class="album-cover-wrap">
            ${
                it.coverUrl
                    ? `<img class="album-cover" src="${escapeHtml(it.coverUrl)}" loading="lazy" />`
                    : `<div class="album-cover-placeholder"></div>`
            }
        </div>

        <div class="album-data">
            <div class="album-title">${escapeHtml(it.title || "untitled")}</div>
            <div class="album-artist">${escapeHtml(it.artistName || "unknown artist")}</div>
        </div>
        `;
        resultsEl.appendChild(li);
    }
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const album = document.getElementById("album").value.trim();
    const artist = document.getElementById("artist").value.trim();

    setStatus("searching..");
    renderSeed(null);
    renderResults([]);

    const url = new URL(`${API_BASE}/api/similar/from-album`);
    url.searchParams.set("album", album);
    if (artist) url.searchParams.set("artist", artist);
    url.searchParams.set("limit", "25");
    url.searchParams.set("albumsOnly", "1");

    try {
        const res = await fetch(url.toString());
        const data = await res.json();

        if (data.error){
            setStatus(`error: ${data.error}`);
            return;
        }
        renderSeed(data.seed);
        renderResults(data.items || []);
        setStatus(`done. found ${(data.items || []).length} results.`);
    } catch {
        setStatus("cant reach the api");
    }
});