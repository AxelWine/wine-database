const uuidv4 = require("uuid").v4;
const fs = require("fs");

const CacheManager = require("./CacheManager.cjs");
const EncryptionManager = require("./EncryptionManager.cjs");

const declareCopy = require("../utils/declareCopy.cjs");

class DatabaseManager {
    constructor({ data, name, password}) {
        const disableEncrypt = typeof password === "undefined";
        const format = disableEncrypt ? "json" : "wdb";
        this.nodeSize = 8000;

        this.cache = new CacheManager({ data });
        this.encryption = new EncryptionManager(password);

        this.hasChanged = [true];
        this.backupHasChanged = [true];
        this.ClassObject = null;
        this.password = password;
        this.name = name;

        this.saveInterval = setInterval(() => {
            if (!this.hasChanged.some(t => t)) return;
            try {
                const allData = this.cache.all();
                if (!fs.existsSync("database")) fs.mkdirSync("database");

                if (allData.length > this.nodeSize) {
                    const clusters = this.splitIntoNodes();
                    clusters.forEach((cluster, index) => {
                        if (!this.hasChanged[index]) return;
                        const encryptedCluster = this.encryption.encrypt(cluster);
                        const tmpFile = `database/.${this.name}.${index}.${format}.tmp`;
                        fs.writeFileSync(tmpFile, encryptedCluster);
                        fs.renameSync(tmpFile, `database/${this.name}.${index}.${format}`);
                    });

                    if (fs.existsSync(`database/${this.name}.${format}`)) fs.unlinkSync(`database/${this.name}.${format}`);
                    if (fs.existsSync(`database/${this.name}.${clusters.length}.${format}`)) fs.unlinkSync(`database/${this.name}.${clusters.length}.${format}`);
                } else {
                    const encryptedData = this.encryption.encrypt(allData);
                    const tmpFile = `database/.${this.name}.${format}.tmp`;
                    fs.writeFileSync(tmpFile, encryptedData);
                    fs.renameSync(tmpFile, `database/${this.name}.${format}`);

                    for (let i = 0; i < 100; i++) {
                        if (fs.existsSync(`database/${this.name}.${i}.${format}`)) fs.unlinkSync(`database/${this.name}.${i}.${format}`);
                    }
                }
                this.hasChanged = this.hasChanged.map(() => false);
            } catch (error) {
                throw new Error(error);
            };
        }, 100);

        this.backupInterval = setInterval(() => {
            if (!this.backupHasChanged.some(t => t)) return;
            try {
                const allData = this.cache.all();

                if (!fs.existsSync("database")) fs.mkdirSync("database");
                if (!fs.existsSync("database/securityBackup")) fs.mkdirSync("database/securityBackup");

                if (allData.length > this.nodeSize) {
                    const clusters = this.splitIntoNodes();
                    clusters.forEach((cluster, index) => {
                        if (!this.backupHasChanged[index]) return;
                        const encryptedCluster = this.encryption.encrypt(cluster);
                        const tmpFile = `database/securityBackup/.${this.name}.${index}.${format}.tmp`;
                        fs.writeFileSync(tmpFile, encryptedCluster);
                        fs.renameSync(tmpFile, `database/securityBackup/${this.name}.${index}.${format}`);
                    });

                    if (fs.existsSync(`database/securityBackup/${this.name}.${format}`)) fs.unlinkSync(`database/securityBackup/${this.name}.${format}`);
                    if (fs.existsSync(`database/securityBackup/${this.name}.${clusters.length}.${format}`)) fs.unlinkSync(`database/securityBackup/${this.name}.${clusters.length}.${format}`);
                } else {
                    const encryptedData = this.encryption.encrypt(allData);
                    const tmpFile = `database/securityBackup/.${this.name}.${format}.tmp`;
                    fs.writeFileSync(tmpFile, encryptedData);
                    fs.renameSync(tmpFile, `database/securityBackup/${this.name}.${format}`);

                    for (let i = 0; i < 100; i++) {
                        if (fs.existsSync(`database/securityBackup/${this.name}.${i}.${format}`)) fs.unlinkSync(`database/securityBackup/${this.name}.${i}.${format}`);
                    }
                };
                this.backupHasChanged = this.backupHasChanged.map(() => false);
            } catch (error) {
                throw new Error(error);
            };
        }, 1000);
    };

    splitIntoNodes() {
        const data = this.cache.all();
        const nodes = [];
        for (let i = 0; i < data.length; i += this.nodeSize) {
            nodes.push(data.slice(i, i + this.nodeSize));
        };
        return nodes;
    };

    getNode = id => {
        const all = this.cache.all();
        const index = all.findIndex(item => item.id === id);
        return index % this.nodeSize;
    };

    defineChange = id => {
        const node = this.getNode(id);
        this.hasChanged[node] = true;
        this.backupHasChanged[node] = true;
    };

    defineClass = ClassObject => {
        this.ClassObject = ClassObject;
    };

    convertToClass = object => this.ClassObject
        ? new this.ClassObject(object)
        : object;

    getAll() {
        const data = this.cache.all();
        return data.map(this.convertToClass);
    };

    get(id) {
        const item = this.cache.get(id);
        return item
            ? this.convertToClass(item)
            : undefined;
    };
    
    filter(func) {
        const data = this.cache.all();
        return data
            .filter(func)
            .map(this.convertToClass);
    };

    find(func) {
        const item = this.cache.all()
            .find(func);
        return item
            ? this.convertToClass(item)
            : undefined;
    };

    some(func) {
        const data = this.cache.all();
        return data.some(func);
    };

    every(func) {
        const data = this.cache.all();
        return data.every(func);
    };

    set(object) {
        let dbObject = this.convertToClass(declareCopy(object));
        if (!object.id) dbObject.id = uuidv4();

        const itemExists = this.cache.get(dbObject.id);
        if (itemExists) this.cache.set(dbObject.id, dbObject);
        else {
            console.error("[WineDB] Item does not exist in database.");
            return;
        };

        this.defineChange(dbObject.id);

        return dbObject;
    };

    setOrCreate(object) {
        let dbObject = this.convertToClass(declareCopy(object));
        if (!object.id) dbObject.id = uuidv4();
        
        this.cache.set(dbObject.id, dbObject);
        this.defineChange(dbObject.id);

        return dbObject;
    };

    create(object) {
        let dbObject = this.convertToClass(declareCopy(object));
        dbObject.id = uuidv4();

        this.cache.set(dbObject.id, dbObject);

        const data = this.cache.all();
        const node = data.length % this.nodeSize;
        this.hasChanged[node] = true;
        this.backupHasChanged[node] = true;

        return dbObject;
    };

    delete(id) {
        this.defineChange(id);
        this.cache.delete(id);
    };
};

module.exports = DatabaseManager;