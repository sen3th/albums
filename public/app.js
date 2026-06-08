const API_BASE = "https://albums-ueia.onrender.com";

const form = document.querySelector("#form");
const statusEl = document.querySelector("#status");
const seedEl = document.querySelector("#seed");
const resultsEl = document.querySelector("#results");
const autocompleteEl = document.querySelector("#autocomplete");
let autocompleteTimer = null;

function setLoading(isLoading){
    const submit = document.querySelector("#submit");
    submit.disabled = isLoading;
    submit.textContent = isLoading ? "searching..." : "find similar albums";
}

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
        <div class="album-symbol"></div>
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

    
    setLoading(true);
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

        if (!(data.items || [].length)){
            setStatus("No albums found");
            return;
        }
        
        setStatus(`done. found ${(data.items || []).length} results.`);
    } catch {
        setStatus("cant reach the api");
    } finally {
        setLoading(false);
    }
});

function rankAutocomplete(items, q){
    const query = q.toLowerCase();
    return [...items].sort((a,b) => {
        const aExact = String(a.title || "").toLowerCase() === query ? 1 : 0;
        const bExact = String(b.title || "").toLowerCase() === query ? 1 : 0;
        if (aExact !== bExact) return bExact - aExact;

        const aScore = (a.want || 0) + (a.have || 0);
        const bScore = (b.want || 0) + (b.have || 0);
        return bScore - aScore;
    })
}

function renderAutocomplete(items){
    autocompleteEl.innerHTML = "";

    for (const item of items){
        const button = document.createElement("button");
        button.type = "button";
        button.className = "autocomplete-item";
        button.innerHTML = `
            <span class="autocomplete-title">${escapeHtml(item.title || "untitled")}</span>
            <span class="autocomplete-artist">${escapeHtml(item.artistName || "unknown artist")}</span>
        `;
        button.addEventListener("click", () => {
            document.getElementById("album").value = item.title || "";
            if (item.artistName) {
                document.getElementById("artist").value = item.artistName;
            }
            autocompleteEl.innerHTML = "";
        })

        autocompleteEl.appendChild(button);   
    }
}

document.getElementById("album").addEventListener("input", () => {
    const q = document.getElementById("album").value.trim();

    clearTimeout(autocompleteTimer);
    if (q.length < 2){
        autocompleteEl.innerHTML = "";
        return;
    }

    autocompleteTimer = setTimeout(async ()=>{
        try{
            const res = await fetch(`${API_BASE}/api/discogs/release-groups?q=${encodeURIComponent(q)}`);
            const data = await res.json();
            renderAutcomplete(rankAutocomplete(data.items || [], q));
        } catch {
            autocompleteEl.innerHTML = "";
        }
    }, 250);
})