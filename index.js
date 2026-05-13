require("dotenv").config();
const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const { getCatalog } = require("./src/catalogs");
const { getMeta } = require("./src/meta");
const { handleSearch } = require("./src/search");
const manifest = require("./src/manifest");

const builder = new addonBuilder(manifest);

// ── Catalog Handler ──────────────────────────────────────────────────────────
builder.defineCatalogHandler(async ({ type, id, extra }) => {
    try {
        if (extra && extra.search) {
            const results = await handleSearch(type, extra.search);
            return { metas: results };
        }
        const metas = await getCatalog(type, id);
        return { metas };
    } catch (err) {
        console.error(`[catalog] ${id} error:`, err.message);
        return { metas: [] };
    }
});

// ── Meta Handler ─────────────────────────────────────────────────────────────
builder.defineMetaHandler(async ({ type, id }) => {
    try {
        const meta = await getMeta(type, id);
        console.log("[meta] Final response id:", meta.id, "type:", meta.type);
        return { meta };
    } catch (err) {
        console.error(`[meta] ${id} error:`, err.message);
        return { meta: null };
    }
});

// ── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 10000;
serveHTTP(builder.getInterface(), { port: PORT });

console.log("🎬 Cinema Hub is running!");
console.log(`📡 http://127.0.0.1:${PORT}/manifest.json`);
