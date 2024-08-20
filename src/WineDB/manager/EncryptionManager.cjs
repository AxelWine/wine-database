const CryptoJS = require('crypto-js');

class EncryptionManager {
    constructor(password) {
        this.password = password;
    }

    encrypt(data) {
        const json = JSON.stringify(data);
        return this.password ? CryptoJS.AES.encrypt(json, this.password).toString() : json;
    }

    decrypt(data) {
        const bytes = CryptoJS.AES.decrypt(data, this.password);
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    }
};

module.exports = EncryptionManager;