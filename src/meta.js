// src/meta.js
const { tmdbFetch, credits, videos, images, poster, backdrop, logo } = require("./tmdb");

function getBestLogo(imgs) {
    if (!imgs || !imgs.logos) return null;
    const sorted = imgs.logos
        .filter(l => l.iso_639_1 === "en" || l.iso_639_1 === null)
        .sort((a, b) => b.vote_average - a.vote_average);
    return sorted[0] ? logo(sorted[0].file_path) : null;
}

function getTrailer(vids) {
    if (!vids || !vids.results) return null;
    const trailer = vids.results.find(v => v.site === "YouTube" && v.type === "Trailer" && v.official)
        || vids.results.find(v => v.site === "YouTube" && v.type === "Trailer");
    return trailer ? { source: "yt", id: trailer.key } : null;
}

// Resolve any ID format to a TMDB numeric ID + media type
async function resolveTmdbId(type, id) {
    const media = type === "series" ? "tv" : "movie";

    // imdb id: tt1234567
    if (id.startsWith("tt")) {
        const data = await tmdbFetch("/find/" + id, { external_source: "imdb_id" });
        const results = media === "movie" ? data.movie_results : data.tv_results;
        if (results && results.length > 0) return { tmdbId: results[0].id, media };
        return null;
    }

    // tmdb: prefix
    if (id.startsWith("tmdb:")) {
        return { tmdbId: id.replace("tmdb:", ""), media };
    }

    // ch: prefix
    if (id.startsWith("ch:")) {
        return { tmdbId: id.replace("ch:", ""), media };
    }

    // bare number
    if (/^\d+$/.test(id)) {
        return { tmdbId: id, media };
    }

    return null;
}

async function getMeta(type, id) {
    console.log(`[meta] type="${type}" id="${id}"`);

    const resolved = await resolveTmdbId(type, id);
    if (!resolved) {
        console.error(`[meta] Could not resolve id: ${id}`);
        return null;
    }

    const { tmdbId, media } = resolved;

    try {
        const [data, cast, vids, imgs] = await Promise.all([
            tmdbFetch(`/${media}/${tmdbId}`, { append_to_response: "external_ids" }),
            credits(media, tmdbId).catch(() => ({ cast: [], crew: [] })),
            videos(media, tmdbId).catch(() => ({ results: [] })),
            images(media, tmdbId).catch(() => ({ logos: [] }))
        ]);

        console.log(`[meta] SUCCESS: "${data.title || data.name}"`);

        const imdbId     = data.external_ids?.imdb_id || (id.startsWith("tt") ? id : null);
        const name       = data.title || data.name || "Unknown";
        const year       = (data.release_date || data.first_air_date || "").slice(0, 4);
        const runtime    = data.runtime || (data.episode_run_time && data.episode_run_time[0]) || null;
        const genres     = (data.genres || []).map(g => g.name);
        const imdbRating = data.vote_average ? data.vote_average.toFixed(1) : null;
        const castList   = (cast.cast || []).slice(0, 10).map(c => c.name);
        const directors  = (cast.crew || []).filter(c => c.job === "Director").map(c => c.name).slice(0, 3);
        const creators   = (data.created_by || []).map(c => c.name);
        const trailerObj = getTrailer(vids);
        const logoUrl    = getBestLogo(imgs);

        const meta = {
            // Use imdb_id as the primary id so Stremio can match streams
            id:          imdbId || `tmdb:${data.id}`,
            type,
            name,
            year,
            poster:      poster(data.poster_path, "w500"),
            background:  backdrop(data.backdrop_path, "w1280"),
            description: (data.overview || "") + (imdbRating ? `\n\n⭐ Rating: ${imdbRating}/10` : ""),
            genres,
            runtime:     runtime ? `${runtime} min` : undefined,
            cast:        castList,
            director:    directors,
            imdbRating,
            links:       []
        };

        if (imdbId) {
            meta.imdb_id = imdbId;
            meta.links.push({ name: "IMDb", category: "IMDb", url: `https://www.imdb.com/title/${imdbId}/` });
        }
        if (data.homepage)    meta.links.push({ name: "Official Site", category: "Web", url: data.homepage });
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

    } catch (err) {
        console.error(`[meta] FAILED ${media}/${tmdbId}:`, err.message);
        return null;
    }
}

module.exports = { getMeta };
