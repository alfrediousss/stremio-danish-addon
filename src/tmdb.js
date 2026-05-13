// src/tmdb.js
// Centralised TMDB API client with in-memory caching and rate-limit safety.

const axios = require("axios");

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMG  = "https://image.tmdb.org/t/p";
const API_KEY   = process.env.TMDB_API_KEY || "e69970c901fcc9b0ddf7a1e28e82904e";

// ── Simple in-memory TTL cache ───────────────────────────────────────────────
const cache = new Map();
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

function cacheGet(key) {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.ts > CACHE_TTL_MS) {
        cache.delete(key);
        return null;
    }
    return entry.data;
}

function cacheSet(key, data) {
    cache.set(key, { ts: Date.now(), data });
}

// ── Core fetch ───────────────────────────────────────────────────────────────
async function tmdbFetch(path, params = {}) {
    const qs = new URLSearchParams({ api_key: API_KEY, ...params }).toString();
    const url = `${TMDB_BASE}${path}?${qs}`;
    const cached = cacheGet(url);
    if (cached) return cached;

    const { data } = await axios.get(url, { timeout: 8000 });
    cacheSet(url, data);
    return data;
}

// ── Image helpers ────────────────────────────────────────────────────────────
const poster   = (path, size = "w500")    => path ? `${TMDB_IMG}/${size}${path}` : null;
const backdrop = (path, size = "w1280")   => path ? `${TMDB_IMG}/${size}${path}` : null;
const logo     = (path, size = "w300")    => path ? `${TMDB_IMG}/${size}${path}` : null;

// ── Convenience endpoints ────────────────────────────────────────────────────
const trending     = (media, window = "week", p = 1) =>
    tmdbFetch(`/trending/${media}/${window}`, { page: p });

const topRated     = (media, p = 1) =>
    tmdbFetch(`/${media}/top_rated`, { page: p });

const popular      = (media, p = 1) =>
    tmdbFetch(`/${media}/popular`, { page: p });

const discover     = (media, params = {}) =>
    tmdbFetch(`/discover/${media}`, params);

const details      = (media, id, append = "") =>
    tmdbFetch(`/${media}/${id}`, append ? { append_to_response: append } : {});

const search       = (media, query, p = 1) =>
    tmdbFetch(`/search/${media}`, { query, page: p, include_adult: false });

const searchMulti  = (query, p = 1) =>
    tmdbFetch("/search/multi", { query, page: p, include_adult: false });

const credits      = (media, id) =>
    tmdbFetch(`/${media}/${id}/credits`);

const videos       = (media, id) =>
    tmdbFetch(`/${media}/${id}/videos`);

const images       = (media, id) =>
    tmdbFetch(`/${media}/${id}/images`, { include_image_language: "en,null" });

module.exports = {
    tmdbFetch,
    trending, topRated, popular, discover, details,
    search, searchMulti, credits, videos, images,
    poster, backdrop, logo
};
