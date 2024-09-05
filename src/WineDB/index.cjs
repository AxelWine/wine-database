const CryptoJS = require("crypto-js");
const fs = require("fs");

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
        const mainFolder = "database";
        const backupFolder = "database/securityBackup";

        const loadWBD = file => {
            const encryptedOriginal = readFile(`${mainFolder}/${file}`);
            const encryptedBackup = readFile(`${backupFolder}/${file}`);
            const encrypted = encryptedOriginal?.length || encryptedBackup?.length;
            if (!encrypted) return [];

            let data = toJson(disableEncrypt
                ? encryptedOriginal
                : decrypt(encryptedOriginal, password, key));
            if (!data) {
                data = toJson(disableEncrypt
                    ? encryptedBackup
                    : decrypt(encryptedBackup, password, key));
                if (!data) console.log("WineDB: Backup file is corrupted.".yellow.bold);
                else console.log("WineDB: Main file is corrupted. Using backup file.".red.bold);
            };

            return data || [];
        };

        const usingCluster = (fs.existsSync(`database/${name}.0.${format}`) && !fs.existsSync(`database/${name}.${format}`))
            || (fs.existsSync(`database/securityBackup/${name}.0.${format}`) && !fs.existsSync(`database/securityBackup/${name}.${format}`));
        if (!usingCluster) {
            const data = loadWBD(`${name}.${format}`);
            return new DatabaseManager({
                data,
                name,
                password: usedPassword
            });
        } else {
            let index = 0;
            let cluster = [];
            while (fs.existsSync(`database/${name}.${index}.${format}`) || fs.existsSync(`database/securityBackup/${name}.${index}.${format}`)) {
                const data = loadWBD(`${name}.${index}.${format}`);
                cluster = cluster.concat(data);
                index++;
            };

            return new DatabaseManager({
                data: cluster,
                name,
                password: usedPassword
            });
        }
    }
};

module.exports = WineDB;