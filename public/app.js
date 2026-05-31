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