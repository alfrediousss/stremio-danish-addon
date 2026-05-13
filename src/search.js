// src/search.js
// Handles Stremio search queries with fuzzy score boosting.

const { searchMulti, poster } = require("./tmdb");

// ── Simple fuzzy relevance score ─────────────────────────────────────────────
// Boost items whose title starts with or contains the query string.
function relevanceScore(item, query) {
    const q     = query.toLowerCase().trim();
    const title = (item.title || item.name || "").toLowerCase();

    let score = item.popularity || 0;

    if (title === q)           score += 10000;
    else if (title.startsWith(q)) score += 5000;
    else if (title.includes(q))   score += 2000;

    // Boost if vote_count is reasonable (indicates real content, not random stub)
    if (item.vote_count > 100)  score += 500;
    if (item.vote_count > 1000) score += 500;

    return score;
}

// ── Map a TMDB result to a lean Stremio meta ──────────────────────────────────
function toMeta(item) {
    const type = item.media_type === "tv" ? "series" : "movie";
    return {
        id:     `tmdb:${item.id}`,
        type,
        name:   item.title || item.name || "Unknown",
        poster: poster(item.poster_path)
    };
}

// ── Public search handler ─────────────────────────────────────────────────────
async function handleSearch(type, query) {
    if (!query || query.length < 2) return [];

    const data = await searchMulti(query);
    const raw  = (data.results || [])
        .filter(r => {
            // Keep only the requested media type
            if (type === "movie"  && r.media_type !== "movie") return false;
            if (type === "series" && r.media_type !== "tv")    return false;
            // Must have a poster and at least minimal info
            return r.poster_path && (r.title || r.name);
        });

    // Sort by relevance
    const sorted = raw.sort((a, b) => relevanceScore(b, query) - relevanceScore(a, query));

    return sorted.map(toMeta);
}

module.exports = { handleSearch };
