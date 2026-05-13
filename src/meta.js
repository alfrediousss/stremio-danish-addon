// src/meta.js
const { details, credits, videos, images, poster, backdrop, logo } = require("./tmdb");

function tmdbType(stremioType) {
    if (stremioType === "series" || stremioType === "tv") return "tv";
    return "movie";
}

function getBestLogo(imgs) {
    if (!imgs || !imgs.logos) return null;
    const sorted = imgs.logos
        .filter(l => l.iso_639_1 === "en" || l.iso_639_1 === null)
        .sort((a, b) => b.vote_average - a.vote_average);
    return sorted[0] ? logo(sorted[0].file_path) : null;
}

function getTrailer(vids) {
    if (!vids || !vids.results) return null;
    const trailer = vids.results.find(
        v => v.site === "YouTube" && v.type === "Trailer" && v.official
    ) || vids.results.find(
        v => v.site === "YouTube" && v.type === "Trailer"
    );
    return trailer ? { source: "yt", id: trailer.key } : null;
}

async function getMeta(type, id) {
    console.log(`[meta] type="${type}" id="${id}"`);

    const tmdbId = id.replace("tmdb:", "");
    const media  = tmdbType(type);

    const [data, cast, vids, imgs] = await Promise.all([
        details(media, tmdbId, "external_ids"),
        credits(media, tmdbId),
        videos(media, tmdbId),
        images(media, tmdbId)
    ]);

    const name       = data.title || data.name || "Unknown";
    const year       = (data.release_date || data.first_air_date || "").slice(0, 4);
    const runtime    = data.runtime || (data.episode_run_time && data.episode_run_time[0]) || null;
    const imdbId     = data.external_ids?.imdb_id || null;
    const genres     = (data.genres || []).map(g => g.name);
    const imdbRating = data.vote_average ? data.vote_average.toFixed(1) : null;

    const castList  = (cast.cast || []).slice(0, 10).map(c => c.name);
    const directors = (cast.crew || []).filter(c => c.job === "Director").map(c => c.name).slice(0, 3);
    const creators  = (data.created_by || []).map(c => c.name);

    const trailerObj = getTrailer(vids);
    const logoUrl    = getBestLogo(imgs);
    const descExtra  = imdbRating ? `\n\n⭐ Rating: ${imdbRating}/10` : "";

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
        links:       []
    };

    if (data.homepage)    meta.links.push({ name: "Official Site", category: "Web", url: data.homepage });
    if (imdbId) {
        meta.links.push({ name: "IMDb", category: "IMDb", url: `https://www.imdb.com/title/${imdbId}/` });
        meta.imdb_id = imdbId;
    }
    if (creators.length)  meta.creator  = creators;
    if (directors.length) meta.director = directors;
    if (trailerObj)       meta.trailers = [trailerObj];
    if (logoUrl)          meta.logo     = logoUrl;

    if (type === "series") {
        meta.status  = data.status;
        meta.country = (data.origin_country || []).join(", ");
    }
    if (!meta.country && data.production_countries?.length) {
        meta.country = data.production_countries.map(c => c.name).join(", ");
    }

    return meta;
}

module.exports = { getMeta };
