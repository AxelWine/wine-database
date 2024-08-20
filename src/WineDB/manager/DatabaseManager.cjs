const uuidv4 = require("uuid").v4;
const fs = require("fs");

const CacheManager = require("./CacheManager.cjs");
const EncryptionManager = require("./EncryptionManager.cjs");

const declareCopy = require("../utils/declareCopy.cjs");

class DatabaseManager {
    constructor({ data, name, password}) {
        const disableEncrypt = typeof password === "undefined";
        const format = disableEncrypt ? "json" : "wdb";

        this.cache = new CacheManager({ data });
        this.encryption = new EncryptionManager(password);

        this.hasChanged = true;
        this.ClassObject = null;
        this.password = password;
        this.name = name;

        this.saveInterval = setInterval(() => {
            if (!this.hasChanged) return;
            try {
                const encrypted = this.encryption.encrypt(this.cache.all());
                if (!fs.existsSync("database")) fs.mkdirSync("database");

                const tmpFile = `database/.${this.name}.${format}.tmp`;
                fs.writeFileSync(tmpFile, encrypted);
                fs.renameSync(tmpFile, `database/${this.name}.${format}`);
                this.hasChanged = false;
            } catch (error) {
                throw new Error(error);
            };
        }, 100);

        this.backupInterval = setInterval(() => {
            try {
                const encrypted = this.encryption.encrypt(this.cache.all());

                if (!fs.existsSync("database")) fs.mkdirSync("database");
                if (!fs.existsSync("database/securityBackup")) fs.mkdirSync("database/securityBackup");
                if (fs.existsSync(`database/securityBackup/${this.name}.${format}`)) fs.unlinkSync(`database/securityBackup/${this.name}.${format}`);
                fs.writeFileSync(`database/securityBackup/${this.name}.${format}`, encrypted);
            } catch (error) {
                throw new Error(error);
            };
        }, 1000);
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

        this.hasChanged = true;

        return dbObject;
    };

    setOrCreate(object) {
        let dbObject = this.convertToClass(declareCopy(object));
        if (!object.id) dbObject.id = uuidv4();
        
        this.cache.set(dbObject.id, dbObject);
        this.hasChanged = true;

        return dbObject;
    };

    create(object) {
        let dbObject = this.convertToClass(declareCopy(object));
        dbObject.id = uuidv4();

        this.cache.set(dbObject.id, dbObject);
        this.hasChanged = true;

        return dbObject;
    };

    delete(id) {
        this.cache.delete(id);
        this.hasChanged = true;
    };
};

module.exports = DatabaseManager;