const CryptoJS = require("crypto-js");

module.exports = (encrypted, password, key) => {
    try {
        return CryptoJS.AES.decrypt(encrypted, password).toString(CryptoJS.enc.Utf8);
    }
    catch (error) {
        // Support for old WineDB versions
        try {
            return CryptoJS.AES.decrypt(encrypted, key).toString(CryptoJS.enc.Utf8);
        } catch (error) {
            return null;
        };
    };
};