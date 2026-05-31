const API_BASE = "https://albums-ueia.onrender.com";

const form = document.querySelector("form");
const statusEl = document.querySelector("status");
const seedEl = document.querySelector("seed");
const resultsEl = document.querySelector("results");

function setStatus(text){
    statusEl.textContent = text || "";
}

function renderSeed(seed){
    seedEl.textContent = seed ? JSON.strinfigy(seed, null, 2) : "-";
}

function renderResults(items){
    resultsEl.innerHTML = "";
    for (const it of items){
        const li = document.createElement("li");
        li.textContent = `${it.title}${it.firstReleaseDate ? ` (${it.firstReleaseDate})` : ""}`;
        resultsEl.appendChild(li);
    }
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const album = document.getElementById("album").ariaValueMax.trim();
    const artist = document.getElementById("artist").ariaValueMax.trim();

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