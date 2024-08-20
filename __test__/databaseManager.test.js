const fs = require("fs");
const WineDB = require("../index.cjs");

class Wine {
    constructor({ name, year }) {
        this.name = name;
        this.year = year;
    };

    get age() {
        return new Date().getFullYear() - this.year;
    };
};

describe("WineDB Tests", () => {
    let db;
    beforeEach(() => {
        fs.rmSync("database", { recursive: true, force: true });
    });

    afterEach(() => {
        clearInterval(db.saveInterval);
        clearInterval(db.backupInterval);
    });

    test("should create database with encryption", (done) => {
        db = WineDB.init("test", "password");
        expect(db).not.toBeNull();
        expect(db.name).toBe("test");
        expect(db.password).not.toBeNull();

        setTimeout(() => {
            expect(fs.existsSync("database")).toBe(true);
            expect(fs.existsSync("database/test.wdb")).toBe(true);
            done();
        }, 100);
    });

    test("should load an existing database with encryption", (done) => {
        db = WineDB.init("test", "password");
        db.create({ name: "test" });
        db.create({ name: "test2" });

        setTimeout(() => {
            // Avoid keeping intervals alive
            clearInterval(db.saveInterval);
            clearInterval(db.backupInterval);

            db = WineDB.init("test", "password");

            const entries = db.getAll();
            expect(entries.length).toBe(2);
            expect(entries[0].name).toBe("test");
            expect(entries[1].name).toBe("test2");

            done();
        }, 100);
    });

    test("should create database without encryption", (done) => {
        db = WineDB.init("test");
        expect(db).not.toBeNull();
        expect(db.name).toBe("test");
        expect(db.password).toBeUndefined();

        setTimeout(() => {
            expect(fs.existsSync("database")).toBe(true);
            expect(fs.existsSync("database/test.json")).toBe(true);
            done();
        }, 100);
    });

    test("should define a class for the database", () => {
        db = WineDB.init("test");
        db.defineClass(Wine);

        expect(db.ClassObject).not.toBeNull();
    });

    test("should convert object to class", () => {
        db = WineDB.init("test");
        db.defineClass(Wine);

        const wine = db.convertToClass({ name: "test", year: 2020 });
        expect(wine).not.toBeNull();
        expect(wine.name).toBe("test");
        expect(wine.year).toBe(2020);
        expect(wine.age).toBe(new Date().getFullYear() - 2020);
    });

    test("should convert return all entries in the database as class objects", () => {
        db = WineDB.init("test");
        db.defineClass(Wine);
        db.create({ name: "test", year: 2020 });
        db.create({ name: "test2", year: 2019 });

        const entries = db.getAll();
        expect(entries.length).toBe(2);
        expect(entries[0].name).toBe("test");
        expect(entries[0].year).toBe(2020);
        expect(entries[0].age).toBe(new Date().getFullYear() - 2020);
        expect(entries[1].name).toBe("test2");
        expect(entries[1].year).toBe(2019);
        expect(entries[1].age).toBe(new Date().getFullYear() - 2019);
    });

    test("should create a new entry in the database", () => {
        db = WineDB.init("test");
        db.create({ name: "test" });

        const entry = db.find(x => x.name === "test");
        expect(entry).not.toBeNull();
        expect(entry.name).toBe("test");
        expect(entry.id).not.toBeNull();
    });

    test("should get an entry from the database", () => {
        db = WineDB.init("test");
        const entry = db.create({ name: "test" });

        const found = db.get(entry.id);
        expect(found).not.toBeNull();
        expect(found.name).toBe("test");
        expect(found.id).toBe(entry.id);
    });

    test("should delete an entry from the database", () => {
        db = WineDB.init("test");
        const entry = db.create({ name: "test" });

        db.delete(entry.id);
        const found = db.get(entry.id);
        expect(found).toBeUndefined();
    });

    test("should update an entry in the database", () => {
        db = WineDB.init("test");
        const entry = db.create({ name: "test" });

        db.set({ id: entry.id, name: "test2" });
        const found = db.get(entry.id);
        expect(found).not.toBeNull();
        expect(found.name).toBe("test2");
    });

    test("should return all entries in the database", () => {
        db = WineDB.init("test");
        db.create({ name: "test" });
        db.create({ name: "test2" });

        const entries = db.getAll();
        expect(entries.length).toBe(2);
        expect(entries[0].name).toBe("test");
        expect(entries[1].name).toBe("test2");
    });

    test("should return first matching entry in the database", () => {
        db = WineDB.init("test");
        db.create({ name: "test" });
        db.create({ name: "test2" });

        const found = db.find(x => x.name === "test2");
        expect(found).not.toBeNull();
        expect(found.name).toBe("test2");
    });

    test("should filter entries in the database", () => {
        db = WineDB.init("test");
        db.create({ name: "test" });
        db.create({ name: "test2" });

        const filtered = db.filter(x => x.name === "test2");
        expect(filtered.length).toBe(1);
        expect(filtered[0].name).toBe("test2");
    });

    test("should check if some entries match the condition", () => {
        db = WineDB.init("test");
        db.create({ name: "test" });
        db.create({ name: "test2" });

        const found = db.some(x => x.name === "test2");
        expect(found).toBe(true);
    });

    test("should check if all entries match the condition", () => {
        db = WineDB.init("test");
        db.create({ name: "test" });
        db.create({ name: "test2" });

        const found = db.every(x => x.name === "test2");
        expect(found).toBe(false);
    });

    test("should create a new entry in the database if it does not exist", () => {
        db = WineDB.init("test");
        db.create({ name: "test" });
        const entry = db.setOrCreate({ name: "test" });

        const found = db.get(entry.id);
        expect(found).not.toBeNull();
        expect(found.name).toBe("test");
    });

    test("should load data from backup file if main file is corrupted", (done) => {
        db = WineDB.init("test", "password");
        db.create({ name: "test" });
        db.create({ name: "test2" });

        setTimeout(() => {
            // Avoid keeping intervals alive
            clearInterval(db.saveInterval);
            clearInterval(db.backupInterval);

            fs.writeFileSync("database/test.wdb", "corrupted data");
            db = WineDB.init("test", "password");

            const entries = db.getAll();
            expect(entries.length).toBe(2);
            expect(entries[0].name).toBe("test");
            expect(entries[1].name).toBe("test2");

            done();
        }, 1000);
    });

    test("should load data from backup file if main file is missing", (done) => {
        db = WineDB.init("test", "password");
        db.create({ name: "test" });
        db.create({ name: "test2" });

        setTimeout(() => {
            // Avoid keeping intervals alive
            clearInterval(db.saveInterval);
            clearInterval(db.backupInterval);

            fs.unlinkSync("database/test.wdb");
            db = WineDB.init("test", "password");

            const entries = db.getAll();
            expect(entries.length).toBe(2);
            expect(entries[0].name).toBe("test");
            expect(entries[1].name).toBe("test2");

            done();
        }, 1000);
    });

    test("should create a new database if backup and main files are corrupted", (done) => {
        db = WineDB.init("test", "password");
        db.create({ name: "test" });
        db.create({ name: "test2" });

        setTimeout(() => {
            // Avoid keeping intervals alive
            clearInterval(db.saveInterval);
            clearInterval(db.backupInterval);

            fs.writeFileSync("database/test.wdb", "corrupted data");
            fs.writeFileSync("database/securityBackup/test.wdb", "corrupted data");
            db = WineDB.init("test", "password");

            const entries = db.getAll();
            expect(entries.length).toBe(0);

            done();
        }, 1000);
    });

    // This is temporary, in the future we plan to add code improvements
    // that will allow handling much larger amounts of data.
    test("should work fine with a large amount of data", () => {
        db = WineDB.init("test");
        let start = Date.now();
        const amount = 100000;
        const maxTime = 1000;
        for (let i = 0; i < amount; i++) {
            db.create({ name: `test${i + 1}` });
        };
        expect(Date.now() - start).toBeLessThan(maxTime);

        start = Date.now();
        const entry900 = db.find(x => x.name === "test900");
        expect(Date.now() - start).toBeLessThan(maxTime);
        expect(entry900).not.toBeNull();
        expect(entry900.name).toBe("test900");

        const entry900Copy = db.get(entry900.id);
        expect(entry900Copy).not.toBeNull();
        expect(entry900Copy.name).toBe("test900");

        start = Date.now();
        const entries = db.filter(x => x.name.includes("test"));
        expect(Date.now() - start).toBeLessThan(maxTime);
        expect(entries.length).toBe(amount);

        start = Date.now();
        db.delete(entry900.id);
        expect(Date.now() - start).toBeLessThan(maxTime);
    });
});