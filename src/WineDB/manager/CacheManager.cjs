class CacheManager {
    constructor({ data }) {
        this.cache = data;
    }

    all() {
        return [...this.cache];
    }

    get(key) {
        return this.cache.find(item => item.id === key);
    }

    set(key, value) {
        const index = this.cache.findIndex(item => item.id === key);
        if (index === -1) {
            this.cache.push({
                id: key,
                ...value
            });
        } else {
            this.cache[index] = {
                id: key,
                ...value
            };
        };
    }

    delete(key) {
        const index = this.cache.findIndex(item => item.id === key);
        if (index !== -1) this.cache.splice(index, 1);
    }
};

module.exports = CacheManager;