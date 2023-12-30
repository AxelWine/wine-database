const CryptoJS = require("crypto-js");
const fs = require("fs");

const Database = require("./database.js");
const WineDB = {
    init: async (name, key) => {
        return new Promise(async (resolve, reject) => {
            if (!fs.existsSync(`database/${name}.wdb`)) {
                return resolve(new Database({
                    data: [],
                    name,
                    password: key
                }));
            };
            
            const encrypted = fs.readFileSync(`database/${name}.wdb`, "utf8");
            const decrypted = CryptoJS.AES.decrypt(encrypted, key).toString(CryptoJS.enc.Utf8);

            return resolve(new Database({
                data: JSON.parse(decrypted),
                name,
                password: key
            }));
        });
    }
};

module.exports = WineDB;