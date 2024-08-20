const CryptoJS = require("crypto-js");

const readFile = require("./readFile.cjs");
const toJson = require("./toJson.cjs");
const decrypt = require("./decrypt.cjs");
require("colors");

const DatabaseManager = require("./manager/DatabaseManager.cjs");
const WineDB = {
    init: (name, key) => {
        const disableEncrypt = typeof key === "undefined";
        const format = disableEncrypt ? "json" : "wdb";
        const password = CryptoJS.SHA256(key).toString();
        const usedPassword = disableEncrypt ? undefined : password;
        const mainFilePath = `database/${name}.${format}`;
        const backupFilePath = `database/securityBackup/${name}.${format}`;

        const encryptedOriginal = readFile(mainFilePath);
        const encryptedBackup = readFile(backupFilePath);
        const encrypted = encryptedOriginal || encryptedBackup;
        if (!encrypted) {
            return new DatabaseManager({
                data: [],
                name,
                password: usedPassword
            });
        };

        data = toJson(disableEncrypt
            ? encryptedOriginal
            : decrypt(encryptedOriginal, password, key));
        if (!data) {
            data = toJson(disableEncrypt
                ? encryptedBackup
                : decrypt(encryptedBackup, password, key));
            if (!data) {
                console.log("WineDB: Backup file is corrupted.".yellow.bold);
                return new DatabaseManager({
                    data: [],
                    name,
                    password: usedPassword
                });
            } else {
                console.log("WineDB: Main file is corrupted. Using backup file.".red.bold);
            };
        };

        return new DatabaseManager({
            data,
            name,
            password: usedPassword
        });
    }
};

module.exports = WineDB;