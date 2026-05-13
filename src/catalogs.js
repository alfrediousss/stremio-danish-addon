const { trending, topRated, discover, tmdbFetch, poster } = require("./tmdb");

const GENRE = {
    action: 28, comedy: 35, drama: 18, horror: 27, thriller: 53,
    crime: 80, mystery: 9648, scifi: 878, family: 10751, romance: 10749
};

async function getImdbId(tmdbId, media) {
    try {
        const data = await tmdbFetch(`/${media}/${tmdbId}/external_ids`);
        return data.imdb_id || null;
    } catch { return null; }
}

async function toMetas(results, type) {
    const media = type === "series" ? "tv" : "movie";
    const items = results.filter(r => r.poster_path);
    const imdbIds = await Promise.all(items.map(r => getImdbId(r.id, media)));

    return items.map((r, i) => {
        const imdbId = imdbIds[i];
        return {
            id:     imdbId || `tmdb:${r.id}`,
            type,
            name:   r.title || r.name || "Unknown",
            poster: poster(r.poster_path),
            ...(imdbId ? { imdb_id: imdbId } : {})
        };
    });
}

const CATALOGS = {
    "ch-trending-movies":    { type: "movie",  fetch: () => trending("movie", "week") },
    "ch-tonights-pick":      { type: "movie",  fetch: () => discover("movie", { sort_by: "vote_average.desc", "vote_count.gte": 3000, "vote_average.gte": 7.8, with_runtime_lte: 130 }) },
    "ch-imdb-elite":         { type: "movie",  fetch: () => discover("movie", { sort_by: "vote_average.desc", "vote_count.gte": 5000, "vote_average.gte": 8.0 }) },
    "ch-critically-acclaimed": { type: "movie", fetch: () => discover("movie", { sort_by: "vote_average.desc", "vote_count.gte": 2000, "vote_average.gte": 7.5 }) },
    "ch-hidden-gems":        { type: "movie",  fetch: () => discover("movie", { sort_by: "vote_average.desc", "vote_count.gte": 200, "vote_count.lte": 2000, "vote_average.gte": 7.5 }) },
    "ch-mind-bending":       { type: "movie",  fetch: () => discover("movie", { with_genres: `${GENRE.scifi},${GENRE.thriller}`, sort_by: "vote_average.desc", "vote_count.gte": 500 }) },
    "ch-comfort-movies":     { type: "movie",  fetch: () => discover("movie", { with_genres: `${GENRE.comedy},${GENRE.romance}`, sort_by: "popularity.desc", "vote_average.gte": 6.5 }) },
    "ch-modern-horror":      { type: "movie",  fetch: () => discover("movie", { with_genres: GENRE.horror, "primary_release_date.gte": "2010-01-01", sort_by: "vote_average.desc", "vote_count.gte": 500, "vote_average.gte": 7.0 }) },
    "ch-late-night":         { type: "movie",  fetch: () => discover("movie", { with_genres: `${GENRE.thriller},${GENRE.crime}`, sort_by: "vote_average.desc", "vote_count.gte": 500, "vote_average.gte": 7.0 }) },
    "ch-fast-paced":         { type: "movie",  fetch: () => discover("movie", { with_genres: `${GENRE.action},${GENRE.thriller}`, sort_by: "vote_average.desc", "vote_count.gte": 1000, "vote_average.gte": 7.5 }) },
    "ch-best-acting":        { type: "movie",  fetch: () => discover("movie", { with_genres: GENRE.drama, sort_by: "vote_average.desc", "vote_count.gte": 1000, "vote_average.gte": 7.8 }) },
    "ch-rainy-day":          { type: "movie",  fetch: () => discover("movie", { with_genres: `${GENRE.drama},${GENRE.romance}`, sort_by: "vote_average.desc", "vote_count.gte": 500, "vote_average.gte": 7.0 }) },
    "ch-random-great":       { type: "movie",  fetch: () => discover("movie", { sort_by: "vote_average.desc", "vote_count.gte": 500, "vote_average.gte": 7.0, page: Math.floor(Math.random() * 8) + 1 }) },
    "ch-danish-movies":      { type: "movie",  fetch: () => discover("movie", { with_original_language: "da", sort_by: "vote_average.desc", "vote_count.gte": 50 }) },
    "ch-nordic-noir":        { type: "movie",  fetch: () => discover("movie", { with_origin_country: "DK|SE|NO|FI|IS", with_genres: `${GENRE.crime},${GENRE.thriller},${GENRE.mystery}`, sort_by: "vote_average.desc", "vote_count.gte": 100 }) },
    "ch-scandi-gems":        { type: "movie",  fetch: () => discover("movie", { with_origin_country: "DK|SE|NO|FI|IS", sort_by: "vote_average.desc", "vote_count.gte": 30, "vote_average.gte": 7.0 }) },
    "ch-trending-series":    { type: "series", fetch: () => trending("tv", "week") },
    "ch-danish-series":      { type: "series", fetch: () => discover("tv", { with_original_language: "da", sort_by: "vote_average.desc", "vote_count.gte": 30 }) },
    "ch-nordic-noir-series": { type: "series", fetch: () => discover("tv", { with_origin_country: "DK|SE|NO|FI|IS", with_genres: `${GENRE.crime},${GENRE.thriller},${GENRE.mystery}`, sort_by: "vote_average.desc", "vote_count.gte": 50 }) },
    "ch-top-series":         { type: "series", fetch: () => topRated("tv") },
    "ch-acclaimed-series":   { type: "series", fetch: () => discover("tv", { sort_by: "vote_average.desc", "vote_count.gte": 1000, "vote_average.gte": 8.0 }) }
};

async function getCatalog(type, id) {
    const def = CATALOGS[id];
    if (!def) return [];
    const data = await def.fetch();
    return toMetas(data.results || [], type);
}

module.exports = { getCatalog };
