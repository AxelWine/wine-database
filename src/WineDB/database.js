const CryptoJS = require("crypto-js");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");

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
                if (fs.existsSync(`database/${this.name}.wdb`)) fs.unlinkSync(`database/${this.name}.wdb`);
                fs.writeFileSync(`database/${this.name}.wdb`, encrypted);
                this.hasChanged = false;
            } catch (error) {
                console.log(error);
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
                console.log(error);
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
        return this.classObject ? items.map(item => new this.classObject(item)) : items;
    };

    getFirst(prop, value) {
        const item = this.data.find(item => item[prop] === value);
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

module.exports = Database;