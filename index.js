const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const axios = require("axios");

// USE YOUR TMDB API KEY HERE
const TMDB_API_KEY = "e69970c901fcc9b0ddf7a1e28e82904e";

const manifest = {
    id: "community.danishaddon",

    version: "1.0.0",

    name: "Danish & Popular Movies",

    description: "Danish movies, TV and random popular picks",

    resources: ["catalog", "meta"],

    types: ["movie", "series"],

    idPrefixes: ["tmdb"],

    behaviorHints: {
        configurable: false
    },

    catalogs: [

        {
            type: "movie",
            id: "trending-movies",
            name: "🔥 Trending Movies",
            extraSupported: [],
            extraRequired: []
        },

        {
            type: "series",
            id: "trending-series",
            name: "📺 Trending TV",
            extraSupported: [],
            extraRequired: []
        },

        {
            type: "movie",
            id: "danish-movies",
            name: "🇩🇰 Danish Movies",
            extraSupported: [],
            extraRequired: []
        },

        {
            type: "series",
            id: "danish-series",
            name: "🇩🇰 Danish Series",
            extraSupported: [],
            extraRequired: []
        },

        {
            type: "movie",
            id: "top-rated-movies",
            name: "🏆 Top Rated Movies",
            extraSupported: [],
            extraRequired: []
        },

        {
            type: "series",
            id: "top-rated-series",
            name: "🏆 Top Rated Series",
            extraSupported: [],
            extraRequired: []
        },

        {
            type: "movie",
            id: "random-popular",
            name: "🎲 Random Popular Movies",
            extraSupported: [],
            extraRequired: []
        },

        {
            type: "movie",
            id: "nordic-noir",
            name: "🕵 Nordic Noir",
            extraSupported: [],
            extraRequired: []
        },

        {
            type: "movie",
            id: "comedy-movies",
            name: "😂 Comedy Movies",
            extraSupported: [],
            extraRequired: []
        },

        {
            type: "movie",
            id: "horror-movies",
            name: "😱 Horror Movies",
            extraSupported: [],
            extraRequired: []
        },

        {
            type: "movie",
            id: "hidden-gems",
            name: "💎 Hidden Gems",
            extraSupported: [],
            extraRequired: []
        }
    ]
};

const builder = new addonBuilder(manifest);

builder.defineCatalogHandler(async ({ type, id }) => {

    let url = "";

    if (id === "danish-movies") {
        url =
        `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=da&sort_by=popularity.desc`;
    }

    if (id === "danish-series") {
        url =
        `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&with_original_language=da&sort_by=popularity.desc`;
    }

    if (id === "random-popular") {

        const randomPage = Math.floor(Math.random() * 20) + 1;

        url =
        `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&page=${randomPage}`;
    }

    if (id === "trending-movies") {
        url =
        `https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_API_KEY}`;

    }

    if (id === "trending-series") {

        url =
        `https://api.themoviedb.org/3/trending/tv/week?api_key=${TMDB_API_KEY}`;
    }

    if (id === "top-rated-movies") {

        url =
        `https://api.themoviedb.org/3/movie/top_rated?api_key=${TMDB_API_KEY}`;
    }

    if (id === "top-rated-series") {

        url =
        `https://api.themoviedb.org/3/tv/top_rated?api_key=${TMDB_API_KEY}`;
    }

    if (id === "nordic-noir") {

        url =
        `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_origin_country=DK|SE|NO&with_genres=80,9648`;
    }

    if (id === "comedy-movies") {

        url =
        `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_genres=35&sort_by=popularity.desc`;
    }

    if (id === "horror-movies") {

        url =
        `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_genres=27&sort_by=popularity.desc`;
    }

    if (id === "hidden-gems") {

        url =
        `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&vote_average.gte=7.5&vote_count.gte=300&sort_by=vote_average.desc`;
    }

    const response = await axios.get(url);

    const metas = response.data.results.map(item => ({
        id: `tmdb:${item.id}`,
        type: type,
        name: item.title || item.name,
        poster: item.poster_path
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : null
    }));

    return { metas };
});

builder.defineMetaHandler(async ({ type, id }) => {

    const tmdbId = id.replace("tmdb:", "");

    const url = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_API_KEY}`;

    const response = await axios.get(url);

    const data = response.data;

    return {
        meta: {
            id: `tmdb:${data.id}`,
            type: type,
            name: data.title || data.name,
            poster: data.poster_path
                ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
                : null,
            description: data.overview
        }
    };
});

// THIS starts the addon server
serveHTTP(builder.getInterface(), { port: process.env.PORT || 10000 });

console.log("Addon running at:");
console.log("http://127.0.0.1:7000/manifest.json");