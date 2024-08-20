const EncryptionManager = require('../src/WineDB/manager/EncryptionManager.cjs');
const CryptoJS = require('crypto-js');

describe('EncryptionManager', () => {
    const password = 'testpassword';
    const data = { key: 'value' };
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(data), password).toString();

    test('should initialize with the correct password', () => {
        const manager = new EncryptionManager(password);
        expect(manager.password).toBe(password);
    });

    test('should correctly encrypt data and return a different string', () => {
        const manager = new EncryptionManager(password);
        const result = manager.encrypt(data);
        expect(result).not.toBe(JSON.stringify(data));
        expect(result).not.toBe(encryptedData);
        expect(result.length).toBe(encryptedData.length);
    });

    test('should correctly decrypt data', () => {
        const manager = new EncryptionManager(password);
        const result = manager.decrypt(encryptedData);
        expect(JSON.stringify(result)).toBe(JSON.stringify(data));
    });

    test('should return original data when no password is provided', () => {
        const manager = new EncryptionManager(null);
        const result = manager.encrypt(data);
        expect(result).toBe(JSON.stringify(data));
    });

    test('should throw an error when decrypting with incorrect password', () => {
        const manager = new EncryptionManager('wrongpassword');
        expect(() => manager.decrypt(encryptedData)).toThrow();
    });
});