// src/manifest.js
// Central manifest – every catalog row visible on the Stremio homepage lives here.
// Order matters: Stremio renders rows top-to-bottom.

module.exports = {
    id: "community.cinemahub",
    version: "2.0.0",
    name: "🎬 Cinema Hub",
    description:
        "Your personal streaming OS. Premium discovery, curated rows, Scandinavian focus, smart recommendations — all inside Stremio.",
    logo: "https://i.imgur.com/5xCUxca.png",
    background: "https://image.tmdb.org/t/p/original/rSPw7tgCH9c6NqICZef4kZjFOQ5.jpg",

    resources: [
        "catalog",
        {
            name: "meta",
            types: ["movie", "series"],
            idPrefixes: ["tt", "tmdb:", "ch:"]
        }
    ],
    types: ["movie", "series"],
    idPrefixes: ["tt", "tmdb:", "ch:"],

    behaviorHints: {
        configurable: false,
        adult: false
    },

    catalogs: [
        // ── MOVIES ────────────────────────────────────────────────────────────
        {
            type: "movie",
            id: "ch-trending-movies",
            name: "🔥 Trending Right Now",
            extraSupported: ["search", "skip"],
            extraRequired: []
        },
        {
            type: "movie",
            id: "ch-tonights-pick",
            name: "🍿 Tonight's Pick",
            extraSupported: ["skip"],
            extraRequired: []
        },
        {
            type: "movie",
            id: "ch-imdb-elite",
            name: "🏆 IMDb Elite",
            extraSupported: ["skip"],
            extraRequired: []
        },
        {
            type: "movie",
            id: "ch-critically-acclaimed",
            name: "🎬 Critically Acclaimed",
            extraSupported: ["skip"],
            extraRequired: []
        },
        {
            type: "movie",
            id: "ch-hidden-gems",
            name: "💎 Hidden Gems",
            extraSupported: ["skip"],
            extraRequired: []
        },
        {
            type: "movie",
            id: "ch-mind-bending",
            name: "🧠 Mind-Bending Movies",
            extraSupported: ["skip"],
            extraRequired: []
        },
        {
            type: "movie",
            id: "ch-comfort-movies",
            name: "☁️ Comfort Movies",
            extraSupported: ["skip"],
            extraRequired: []
        },
        {
            type: "movie",
            id: "ch-modern-horror",
            name: "😱 Best Modern Horror",
            extraSupported: ["skip"],
            extraRequired: []
        },
        {
            type: "movie",
            id: "ch-late-night",
            name: "🌙 Late Night Thrillers",
            extraSupported: ["skip"],
            extraRequired: []
        },
        {
            type: "movie",
            id: "ch-fast-paced",
            name: "⚡ Fast-Paced Masterpieces",
            extraSupported: ["skip"],
            extraRequired: []
        },
        {
            type: "movie",
            id: "ch-best-acting",
            name: "🎭 Best Acting Performances",
            extraSupported: ["skip"],
            extraRequired: []
        },
        {
            type: "movie",
            id: "ch-rainy-day",
            name: "🌧️ Rainy Day Movies",
            extraSupported: ["skip"],
            extraRequired: []
        },
        {
            type: "movie",
            id: "ch-random-great",
            name: "🎲 Random Great Movies",
            extraSupported: ["skip"],
            extraRequired: []
        },
        // ── SCANDINAVIAN ───────────────────────────────────────────────────────
        {
            type: "movie",
            id: "ch-danish-movies",
            name: "🇩🇰 Danish Essentials",
            extraSupported: ["skip"],
            extraRequired: []
        },
        {
            type: "movie",
            id: "ch-nordic-noir",
            name: "🕵️ Nordic Noir",
            extraSupported: ["skip"],
            extraRequired: []
        },
        {
            type: "movie",
            id: "ch-scandi-gems",
            name: "❄️ Scandinavian Hidden Gems",
            extraSupported: ["skip"],
            extraRequired: []
        },
        // ── SERIES ────────────────────────────────────────────────────────────
        {
            type: "series",
            id: "ch-trending-series",
            name: "📺 Best TV Right Now",
            extraSupported: ["search", "skip"],
            extraRequired: []
        },
        {
            type: "series",
            id: "ch-danish-series",
            name: "🇩🇰 Danish TV",
            extraSupported: ["skip"],
            extraRequired: []
        },
        {
            type: "series",
            id: "ch-nordic-noir-series",
            name: "🕵️ Nordic Noir Series",
            extraSupported: ["skip"],
            extraRequired: []
        },
        {
            type: "series",
            id: "ch-top-series",
            name: "🏆 Top Rated Series",
            extraSupported: ["skip"],
            extraRequired: []
        },
        {
            type: "series",
            id: "ch-acclaimed-series",
            name: "🎬 Critically Acclaimed Series",
            extraSupported: ["skip"],
            extraRequired: []
        }
    ]
};
