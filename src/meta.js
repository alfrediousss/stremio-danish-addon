// src/meta.js
// Builds a rich Stremio meta object for a single title using TMDB detail endpoints.

const { details, credits, videos, images, poster, backdrop, logo } = require("./tmdb");

// ── Map TMDB media type ──────────────────────────────────────────────────────
function tmdbType(stremioType) {
    return stremioType === "series" ? "tv" : "movie";
}

// ── Extract best English logo from TMDB images ───────────────────────────────
function getBestLogo(imgs) {
    if (!imgs || !imgs.logos) return null;
    const sorted = imgs.logos
        .filter(l => l.iso_639_1 === "en" || l.iso_639_1 === null)
        .sort((a, b) => b.vote_average - a.vote_average);
    return sorted[0] ? logo(sorted[0].file_path) : null;
}

// ── Extract YouTube trailer ───────────────────────────────────────────────────
function getTrailer(vids) {
    if (!vids || !vids.results) return null;
    const trailer = vids.results.find(
        v => v.site === "YouTube" && v.type === "Trailer" && v.official
    ) || vids.results.find(
        v => v.site === "YouTube" && v.type === "Trailer"
    );
    return trailer
        ? { source: "yt", id: trailer.key }
        : null;
}

// ── Build Stremio meta ───────────────────────────────────────────────────────
async function getMeta(type, id) {
    const tmdbId = id.replace("tmdb:", "");
    const media  = tmdbType(type);

    // Fetch all three in parallel
    const [data, cast, vids, imgs] = await Promise.all([
        details(media, tmdbId, "external_ids"),
        credits(media, tmdbId),
        videos(media, tmdbId),
        images(media, tmdbId)
    ]);

    // ── Basic fields ──────────────────────────────────────────────────────────
    const name        = data.title || data.name || "Unknown";
    const year        = (data.release_date || data.first_air_date || "").slice(0, 4);
    const runtime     = data.runtime || (data.episode_run_time && data.episode_run_time[0]) || null;
    const imdbId      = data.external_ids?.imdb_id || null;
    const genres      = (data.genres || []).map(g => g.name);
    const imdbRating  = data.vote_average ? data.vote_average.toFixed(1) : null;

    // ── Cast (top 10) ─────────────────────────────────────────────────────────
    const castList = (cast.cast || [])
        .slice(0, 10)
        .map(c => c.name);

    // ── Director / Creator ────────────────────────────────────────────────────
    const directors = (cast.crew || [])
        .filter(c => c.job === "Director")
        .map(c => c.name)
        .slice(0, 3);

    const creators = (data.created_by || []).map(c => c.name);

    // ── Trailer & logo ────────────────────────────────────────────────────────
    const trailerObj = getTrailer(vids);
    const logoUrl    = getBestLogo(imgs);

    // ── Description with IMDb link ────────────────────────────────────────────
    const descExtra = imdbId
        ? `\n\n⭐ IMDb: ${imdbRating}/10`
        : imdbRating ? `\n\n⭐ Rating: ${imdbRating}/10` : "";

    // ── Build meta object ─────────────────────────────────────────────────────
    const meta = {
        id:          `tmdb:${data.id}`,
        type,
        name,
        year,
        poster:      poster(data.poster_path, "w500"),
        background:  backdrop(data.backdrop_path, "w1280"),
        description: (data.overview || "") + descExtra,
        genres,
        runtime:     runtime ? `${runtime} min` : undefined,
        cast:        castList,
        director:    directors,
        imdbRating,
        links: []
    };

    // Official website
    if (data.homepage) {
        meta.links.push({ name: "Official Site", category: "Web", url: data.homepage });
    }

    // IMDb link
    if (imdbId) {
        meta.links.push({ name: "IMDb", category: "IMDb", url: `https://www.imdb.com/title/${imdbId}/` });
        meta.imdb_id = imdbId;
    }

    // Creator/director
    if (creators.length)   meta.creator = creators;
    if (directors.length)  meta.director = directors;

    // Trailer
    if (trailerObj) meta.trailers = [trailerObj];

    // Logo
    if (logoUrl) meta.logo = logoUrl;

    // Series-specific
    if (type === "series") {
        meta.status = data.status;
        meta.country = (data.origin_country || []).join(", ");
    }

    // Country
    if (!meta.country && data.production_countries?.length) {
        meta.country = data.production_countries.map(c => c.name).join(", ");
    }

    return meta;
}

module.exports = { getMeta };
