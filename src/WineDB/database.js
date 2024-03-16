import CryptoJS from "crypto-js";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

class Database {
    constructor({ data, name, password}) {
        this.data = data;
        this.hasChanged = true;
        this.classObject = null;
        this.password = password;
        this.name = name;

        setInterval(() => {
            if (!this.hasChanged) return;
            try {
                const encrypted = CryptoJS.AES.encrypt(JSON.stringify(this.data), this.password).toString();

                if (!fs.existsSync("database")) fs.mkdirSync("database");

                const tmpFile = `database/.${this.name}.wdb.tmp`;
                fs.writeFileSync(tmpFile, encrypted);
                fs.renameSync(tmpFile, `database/${this.name}.wdb`);
                this.hasChanged = false;
            } catch (error) {
                throw new Error(error);
            };
        }, 1000);

        setInterval(() => {
            try {
                const encrypted = CryptoJS.AES.encrypt(JSON.stringify(this.data), this.password).toString();

                if (!fs.existsSync("database")) fs.mkdirSync("database");
                if (!fs.existsSync("database/securityBackup")) fs.mkdirSync("database/securityBackup");
                if (fs.existsSync(`database/securityBackup/${this.name}.wdb`)) fs.unlinkSync(`database/securityBackup/${this.name}.wdb`);
                fs.writeFileSync(`database/securityBackup/${this.name}.wdb`, encrypted);
            } catch (error) {
                throw new Error(error);
            };
        }, 10000);
    };

    defineClass = classObject => {
        this.classObject = classObject;
    };
    
    getAll() {
        return this.classObject ? this.data.map(item => new this.classObject(item)) : this.data;
    };

    get(id) {
        const item = this.data.filter(item => item.id === id);
        if (!item.length) return;
        return this.classObject ? new this.classObject(item) : item;
    };
    
    filter(func) {
        return this.classObject
            ? this.data.filter(func).map(item => new this.classObject(item))
            : this.data.filter(func);
    };

    find(func) {
        const item = this.data.find(func);
        if (!item) return;
        return this.classObject ? new this.classObject(item) : item;
    };

    set(object) {
        let dbObject = JSON.parse(JSON.stringify(object));
        if (!dbObject.id) dbObject.id = uuidv4();
        if (this.classObject) dbObject = new this.classObject(dbObject);

        const itemExists = this.data.find(item => item.id === dbObject.id);
        if (itemExists) this.data = this.data.map(item => item.id === dbObject.id ? dbObject : item);
        else {
            console.error("[WineDB] Item does not exist in database.");
            return;
        };

        this.hasChanged = true;

        return dbObject;
    };

    setOrCreate(object) {
        let dbObject = JSON.parse(JSON.stringify(object));
        if (!dbObject.id) dbObject.id = uuidv4();
        if (this.classObject) dbObject = new this.classObject(dbObject);

        const itemExists = this.data.find(item => item.id === dbObject.id);
        if (itemExists) this.data = this.data.map(item => item.id === dbObject.id ? dbObject : item);
        else this.data.push(dbObject);

        this.hasChanged = true;

        return dbObject;
    };

    create(object) {
        let dbObject = JSON.parse(JSON.stringify(object));
        dbObject.id = uuidv4();
        if (this.classObject) dbObject = new this.classObject(dbObject);

        this.data.push(dbObject);
        this.hasChanged = true;

        return dbObject;
    };

    delete(id) {
        this.data = this.data.filter(item => item.id !== id);
        this.hasChanged = true;
    };
};

export default Database;