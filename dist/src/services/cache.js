import crypto from 'crypto';
const cacheStore = new Map();
export function generateHash(model, message) {
    const normalized = {
        model,
        message: message.trim()
    };
    const str = JSON.stringify(normalized);
    return crypto.createHash('sha256').update(str).digest('hex');
}
export function getCached(hash) {
    const entry = cacheStore.get(hash);
    if (!entry)
        return undefined;
    return entry.response;
}
export function setCache(hash, response) {
    cacheStore.set(hash, {
        response,
        cachedAt: Date.now()
    });
}
export function getCacheStats() {
    return {
        size: cacheStore.size,
        keys: Array.from(cacheStore.keys())
    };
}
