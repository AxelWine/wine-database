import CryptoJS from "crypto-js";
import fs from "fs";

import Database from "./database.js";
const WineDB = {
    init: async (name, key) => {
        return new Promise(async (resolve, reject) => {
            const password = CryptoJS.SHA256(key).toString();
            
            if (!fs.existsSync(`database/${name}.wdb`)) {
                return resolve(new Database({
                    data: [],
                    name,
                    password
                }));
            };
            
            const encrypted = fs.readFileSync(`database/${name}.wdb`, "utf8");
            let decrypted;
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

            return resolve(new Database({
                data: JSON.parse(decrypted),
                name,
                password
            }));
        });
    }
};

export default WineDB;