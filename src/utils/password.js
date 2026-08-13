const crypto = require("crypto");

const KEY_LENGTH = 64;

function scrypt(password, salt) {
    return new Promise((resolve, reject) => {
        crypto.scrypt(password, salt, KEY_LENGTH, (err, derivedKey) => {
            if (err) return reject(err);
            resolve(derivedKey);
        });
    });
}

async function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString("hex");
    const derivedKey = await scrypt(password, salt);
    return `scrypt$${salt}$${derivedKey.toString("hex")}`;
}

async function verifyPassword(password, storedPassword) {
    if (!storedPassword.startsWith("scrypt$")) {
        const supplied = Buffer.from(password);
        const stored = Buffer.from(storedPassword);
        return supplied.length === stored.length && crypto.timingSafeEqual(supplied, stored);
    }

    const [, salt, storedHex] = storedPassword.split("$");
    if (!salt || !storedHex) return false;

    const supplied = await scrypt(password, salt);
    const stored = Buffer.from(storedHex, "hex");
    return supplied.length === stored.length && crypto.timingSafeEqual(supplied, stored);
}

module.exports = { hashPassword, verifyPassword };
