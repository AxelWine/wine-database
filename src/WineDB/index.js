const CryptoJS = require("crypto-js");
const fs = require("fs");

const Database = require("./database.js");
const WineDB = {
    init: async (name, key) => {
        return new Promise(async (resolve, reject) => {
            const disableEncrypt = !key;
            const password = CryptoJS.SHA256(key).toString();
            
            if (!fs.existsSync(`database/${name}.wdb`)) {
                return resolve(new Database({
                    data: [],
                    name,
                    password: disableEncrypt ? null : password
                }));
            };
            
            const encrypted = fs.readFileSync(`database/${name}.wdb`, "utf8");
            let decrypted;
            if (disableEncrypt) {
                decrypted = encrypted;
            }
            else {
                try {
                    decrypted = CryptoJS.AES.decrypt(encrypted, password).toString(CryptoJS.enc.Utf8);
                }
                catch (error) {
                    // Support for old WineDB versions
                    try {
                        decrypted = CryptoJS.AES.decrypt(encrypted, key).toString(CryptoJS.enc.Utf8);
                    }
                    catch (error) {
                        return reject(new Error("Invalid WineDB password"));
                    };
                };
            };

            return resolve(new Database({
                data: JSON.parse(decrypted),
                name,
                password: disableEncrypt ? null : password
            }));
        });
    }
};

module.exports = WineDB;