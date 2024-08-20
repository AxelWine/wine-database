const fs = require("fs");
const CacheManager = require("../src/WineDB/manager/CacheManager.cjs");

describe("WineDB Tests", () => {
    test("should create a new entry in the cache", () => {
        const cache = new CacheManager({ data: []});
        cache.set("1", { name: "test" });
        cache.set("2", { name: "test2" });

        const entries = cache.all();
        expect(entries.length).toBe(2);
        expect(entries[0].name).toBe("test");
        expect(entries[1].name).toBe("test2");
    });

    test("should get an entry from the cache", () => {
        const cache = new CacheManager({ data: []});
        cache.set("1", { name: "test" });

        const entry = cache.get("1");
        expect(entry).not.toBeNull();
        expect(entry.name).toBe("test");
    });

    test("should delete an entry from the cache", () => {
        const cache = new CacheManager({ data: []});
        cache.set("1", { name: "test" });
        cache.delete("1");

        const entry = cache.get("1");
        expect(entry).toBeUndefined();
    });

    test("should update an entry in the cache", () => {
        const cache = new CacheManager({ data: []});
        cache.set("1", { name: "test" });
        cache.set("1", { name: "test2" });

        const entry = cache.get("1");
        expect(entry).not.toBeNull();
        expect(entry.name).toBe("test2");
    });

    test("should index data by id", () => {
        const cache = new CacheManager({ data: [{ id: "1", name: "test" }]});

        const entry = cache.get("1");
        expect(entry).not.toBeNull();
        expect(entry.name).toBe("test");
    });

    test("should return all entries in the cache", () => {
        const cache = new CacheManager({ data: [{ id: "1", name: "test" }, { id: "2", name: "test2" }]});

        const entries = cache.all();
        expect(entries.length).toBe(2);
        expect(entries[0].name).toBe("test");
        expect(entries[0].id).toBe("1");
        expect(entries[1].name).toBe("test2");
        expect(entries[1].id).toBe("2");
    });
});