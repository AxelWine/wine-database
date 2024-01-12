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

    get(prop, value) {
        const items = this.data.filter(item => item[prop] === value);
        if (!items.length) return this.classObject ? [new this.classObject({})] : [{}];
        return this.classObject ? items.map(item => new this.classObject(item)) : items;
    };

    getFirst(prop, value) {
        const item = this.data.find(item => item[prop] === value);
        if (!item) return this.classObject ? new this.classObject({}) : {};
        return this.classObject ? new this.classObject(item) : item;
    };

    set(object) {
        if (!object.id) object.id = uuidv4();

        const itemExists = this.data.find(item => item.id === object.id);
        if (itemExists) this.data = this.data.map(item => item.id === object.id ? object : item);
        else this.data.push(object);

        this.hasChanged = true;
    };

    delete(prop, value) {
        this.data = this.data.filter(item => item[prop] !== value);
        this.hasChanged = true;
    };
};

export default Database;