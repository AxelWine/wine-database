const fs = require("fs");
const WineDB = require("../index.cjs");

describe("WineDB Tests with Cluster", () => {
    let db;
    beforeEach(() => {
        fs.rmSync("database", { recursive: true, force: true });
    });

    afterEach(() => {
        clearInterval(db.saveInterval);
        clearInterval(db.backupInterval);
    });

    test("should work fine with a large amount of data", () => {
        db = WineDB.init("test");
        let start = Date.now();
        const amount = 100000;
        const maxTime = 300;
        for (let i = 0; i < amount; i++) {
            db.create({ name: `test${i + 1}` });
        };
        expect(Date.now() - start).toBeLessThan(80000);

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

    test("should create two nodes if entries length is greater than 8000", (done) => {
        db = WineDB.init("test", "password");
        const amount = 8001;
        for (let i = 0; i < amount; i++) {
            db.create({ name: `test${i + 1}` });
        };
        expect(db.splitIntoNodes().length).toBe(2);

        setTimeout(() => {
            expect(fs.existsSync("database")).toBe(true);
            expect(fs.existsSync("database/test.wdb")).toBe(false);
            expect(fs.existsSync("database/test.0.wdb")).toBe(true);
            expect(fs.existsSync("database/test.1.wdb")).toBe(true);
            done();
        }, 100);
    });

    test("should create three nodes if entries length is greater than 16000", (done) => {
        db = WineDB.init("test", "password");
        const amount = 16001;
        for (let i = 0; i < amount; i++) {
            db.create({ name: `test${i + 1}` });
        };
        expect(db.splitIntoNodes().length).toBe(3);

        setTimeout(() => {
            expect(fs.existsSync("database")).toBe(true);
            expect(fs.existsSync("database/test.wdb")).toBe(false);
            expect(fs.existsSync("database/test.0.wdb")).toBe(true);
            expect(fs.existsSync("database/test.1.wdb")).toBe(true);
            expect(fs.existsSync("database/test.2.wdb")).toBe(true);
            done();
        }, 100);
    });

    test("should load all nodes when the database is initialized", (done) => {
        db = WineDB.init("test", "password");
        const amount = 8001;
        for (let i = 0; i < amount; i++) {
            db.create({ name: `test${i + 1}` });
        };

        setTimeout(() => {
            clearInterval(db.saveInterval);
            clearInterval(db.backupInterval);

            db = WineDB.init("test", "password");
            const entries = db.getAll();
            expect(entries.length).toBe(amount);
            done();
        }, 1000);
    });

    test("should load data from backup file if one of the nodes is corrupted", (done) => {
        db = WineDB.init("test", "password");
        const amount = 8001;
        for (let i = 0; i < amount; i++) {
            db.create({ name: `test${i + 1}` });
        };

        setTimeout(() => {
            clearInterval(db.saveInterval);
            clearInterval(db.backupInterval);
            
            fs.writeFileSync("database/test.0.wdb", "corrupted data");
            db = WineDB.init("test", "password");

            const entries = db.getAll();
            expect(entries.length).toBe(amount);
            done();
        }, 1000);
    });

    test("should load data from backup file if one of the nodes is missing", (done) => {
        db = WineDB.init("test", "password");
        const amount = 8001;
        for (let i = 0; i < amount; i++) {
            db.create({ name: `test${i + 1}` });
        };

        setTimeout(() => {
            clearInterval(db.saveInterval);
            clearInterval(db.backupInterval);
            
            fs.unlinkSync("database/test.0.wdb");
            db = WineDB.init("test", "password");

            const entries = db.getAll();
            expect(entries.length).toBe(amount);
            done();
        }, 1000);
    });

    test("should load data from backup file if all nodes are corrupted", (done) => {
        db = WineDB.init("test", "password");
        const amount = 8001;
        for (let i = 0; i < amount; i++) {
            db.create({ name: `test${i + 1}` });
        };

        setTimeout(() => {
            clearInterval(db.saveInterval);
            clearInterval(db.backupInterval);
            
            fs.writeFileSync("database/test.0.wdb", "corrupted data");
            fs.writeFileSync("database/test.1.wdb", "corrupted data");
            db = WineDB.init("test", "password");

            const entries = db.getAll();
            expect(entries.length).toBe(8001);
            done();
        }, 1000);
    });

    test("should create a new database if backup and main files are corrupted", (done) => {
        db = WineDB.init("test", "password");
        const amount = 8001;
        for (let i = 0; i < amount; i++) {
            db.create({ name: `test${i + 1}` });
        };

        setTimeout(() => {
            clearInterval(db.saveInterval);
            clearInterval(db.backupInterval);
            
            fs.writeFileSync("database/test.0.wdb", "corrupted data");
            fs.writeFileSync("database/test.1.wdb", "corrupted data");
            fs.writeFileSync("database/securityBackup/test.0.wdb", "corrupted data");
            fs.writeFileSync("database/securityBackup/test.1.wdb", "corrupted data");
            db = WineDB.init("test", "password");

            const entries = db.getAll();
            expect(entries.length).toBe(0);
            done();
        }, 1000);
    });
});