// src/catalogs.js
// Maps every catalog ID defined in manifest.js to a TMDB query.
// Returns an array of lean Stremio meta objects (id, type, name, poster).

const {
    trending, topRated, popular, discover, poster
} = require("./tmdb");

// ── TMDB genre IDs ───────────────────────────────────────────────────────────
const GENRE = {
    action:    28,
    comedy:    35,
    drama:     18,
    horror:    27,
    thriller:  53,
    crime:     80,
    mystery:   9648,
    scifi:     878,
    animation: 16,
    family:    10751,
    romance:   10749,
    music:     10402,
    history:   36,
    war:       10752
};

// ── Helper: map a TMDB results array to Stremio metas ────────────────────────
function toMetas(results, type) {
    return results
        .filter(r => r.poster_path)
        .map(r => ({
            id:     `ch:${r.id}`,
            type,
            name:   r.title || r.name || "Unknown",
            poster: poster(r.poster_path)
        }));
}

// ── Catalog definitions ──────────────────────────────────────────────────────
// Each entry: { fetch: async () => TMDB response, type }
const CATALOGS = {

    // ── Movies ────────────────────────────────────────────────────────────────
    "ch-trending-movies": {
        type: "movie",
        fetch: () => trending("movie", "week")
    },
    "ch-tonights-pick": {
        type: "movie",
        fetch: () => discover("movie", {
            sort_by: "vote_average.desc",
            "vote_count.gte": 3000,
            "vote_average.gte": 7.8,
            with_runtime_lte: 130
        })
    },
    "ch-imdb-elite": {
        type: "movie",
        fetch: () => discover("movie", {
            sort_by: "vote_average.desc",
            "vote_count.gte": 5000,
            "vote_average.gte": 8.0
        })
    },
    "ch-critically-acclaimed": {
        type: "movie",
        fetch: () => discover("movie", {
            sort_by: "vote_average.desc",
            "vote_count.gte": 2000,
            "vote_average.gte": 7.5,
            without_genres: `${GENRE.animation},${GENRE.family}`
        })
    },
    "ch-hidden-gems": {
        type: "movie",
        fetch: () => discover("movie", {
            sort_by: "vote_average.desc",
            "vote_count.gte": 200,
            "vote_count.lte": 2000,
            "vote_average.gte": 7.5
        })
    },
    "ch-mind-bending": {
        type: "movie",
        fetch: () => discover("movie", {
            with_genres: `${GENRE.scifi},${GENRE.thriller}`,
            sort_by: "vote_average.desc",
            "vote_count.gte": 500
        })
    },
    "ch-comfort-movies": {
        type: "movie",
        fetch: () => discover("movie", {
            with_genres: `${GENRE.comedy},${GENRE.romance}`,
            sort_by: "popularity.desc",
            "vote_average.gte": 6.5
        })
    },
    "ch-modern-horror": {
        type: "movie",
        fetch: () => discover("movie", {
            with_genres: GENRE.horror,
            sort_by: "vote_average.desc",
            "primary_release_date.gte": "2010-01-01",
            "vote_count.gte": 500,
            "vote_average.gte": 7.0
        })
    },
    "ch-late-night": {
        type: "movie",
        fetch: () => discover("movie", {
            with_genres: `${GENRE.thriller},${GENRE.crime}`,
            sort_by: "vote_average.desc",
            "vote_count.gte": 500,
            "vote_average.gte": 7.0
        })
    },
    "ch-fast-paced": {
        type: "movie",
        fetch: () => discover("movie", {
            with_genres: `${GENRE.action},${GENRE.thriller}`,
            sort_by: "vote_average.desc",
            "vote_count.gte": 1000,
            "vote_average.gte": 7.5
        })
    },
    "ch-best-acting": {
        type: "movie",
        fetch: () => discover("movie", {
            with_genres: GENRE.drama,
            sort_by: "vote_average.desc",
            "vote_count.gte": 1000,
            "vote_average.gte": 7.8
        })
    },
    "ch-rainy-day": {
        type: "movie",
        fetch: () => discover("movie", {
            with_genres: `${GENRE.drama},${GENRE.romance}`,
            sort_by: "vote_average.desc",
            "vote_count.gte": 500,
            "vote_average.gte": 7.0
        })
    },
    "ch-random-great": {
        type: "movie",
        fetch: () => {
            const page = Math.floor(Math.random() * 8) + 1;
            return discover("movie", {
                sort_by: "vote_average.desc",
                "vote_count.gte": 500,
                "vote_average.gte": 7.0,
                page
            });
        }
    },

    // ── Scandinavian ─────────────────────────────────────────────────────────
    "ch-danish-movies": {
        type: "movie",
        fetch: () => discover("movie", {
            with_original_language: "da",
            sort_by: "vote_average.desc",
            "vote_count.gte": 50
        })
    },
    "ch-nordic-noir": {
        type: "movie",
        fetch: () => discover("movie", {
            with_origin_country: "DK|SE|NO|FI|IS",
            with_genres: `${GENRE.crime},${GENRE.thriller},${GENRE.mystery}`,
            sort_by: "vote_average.desc",
            "vote_count.gte": 100
        })
    },
    "ch-scandi-gems": {
        type: "movie",
        fetch: () => discover("movie", {
            with_origin_country: "DK|SE|NO|FI|IS",
            sort_by: "vote_average.desc",
            "vote_count.gte": 30,
            "vote_average.gte": 7.0
        })
    },

    // ── Series ────────────────────────────────────────────────────────────────
    "ch-trending-series": {
        type: "series",
        fetch: () => trending("tv", "week")
    },
    "ch-danish-series": {
        type: "series",
        fetch: () => discover("tv", {
            with_original_language: "da",
            sort_by: "vote_average.desc",
            "vote_count.gte": 30
        })
    },
    "ch-nordic-noir-series": {
        type: "series",
        fetch: () => discover("tv", {
            with_origin_country: "DK|SE|NO|FI|IS",
            with_genres: `${GENRE.crime},${GENRE.thriller},${GENRE.mystery}`,
            sort_by: "vote_average.desc",
            "vote_count.gte": 50
        })
    },
    "ch-top-series": {
        type: "series",
        fetch: () => topRated("tv")
    },
    "ch-acclaimed-series": {
        type: "series",
        fetch: () => discover("tv", {
            sort_by: "vote_average.desc",
            "vote_count.gte": 1000,
            "vote_average.gte": 8.0
        })
    }
};

// ── Public entry point ───────────────────────────────────────────────────────
async function getCatalog(type, id) {
    const def = CATALOGS[id];
    if (!def) return [];

    const data = await def.fetch();
    const results = data.results || [];
    return toMetas(results, type);
}

module.exports = { getCatalog };
