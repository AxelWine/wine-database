class CacheManager {
    constructor({ data }) {
        this.cache = this.indexData(data, "id");
    }

    indexData(data, keyField) {
        return data.reduce((acc, item) => {
            acc[item[keyField]] = item;
            return acc;
        }, {});
    }

    all() {
        return Object.entries(this.cache).map(([id, value]) => ({ id, ...value }));
    }

    get(key) {
        return this.cache[key];
    }

    set(key, value) {
        this.cache[key] = value;
    }

    delete(key) {
        delete this.cache[key];
    }
};

module.exports = CacheManager;