const CryptoJS = require("crypto-js");
const fs = require("fs");

const Database = require("./database.cjs");
const WineDB = {
    init: (name, key) => {
        const disableEncrypt = !key;
        const format = disableEncrypt ? "json" : "wdb";
        const password = CryptoJS.SHA256(key).toString();
        
        if (!fs.existsSync(`database/${name}.${format}`)) {
            return new Database({
                data: [],
                name,
                password: disableEncrypt ? null : password
            });
        };
        
        const encrypted = fs.readFileSync(`database/${name}.${format}`, "utf8");
        let decrypted = disableEncrypt ? encrypted : null;
        if (!disableEncrypt) {
            try {
                decrypted = CryptoJS.AES.decrypt(encrypted, password).toString(CryptoJS.enc.Utf8);
            }
            catch (error) {
                // Support for old WineDB versions
                try {
                    decrypted = CryptoJS.AES.decrypt(encrypted, key).toString(CryptoJS.enc.Utf8);
                }
                catch (error) {
                    return new Error("Invalid WineDB password");
                };
            };
        };

        return new Database({
            data: JSON.parse(decrypted),
            name,
            password: disableEncrypt ? null : password
        });
    }
};

module.exports = WineDB;