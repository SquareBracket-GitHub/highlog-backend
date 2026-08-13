const crypto = require("crypto");

const TOKEN_TTL_SECONDS = 60 * 60 * 24;

function getSecret() {
    const secret = process.env.AUTH_TOKEN_SECRET;
    if (secret) return secret;
    if (process.env.NODE_ENV === "production") {
        throw new Error("AUTH_TOKEN_SECRET is required in production");
    }
    return "highlog-local-development-secret-change-me";
}

function encode(value) {
    return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function sign(payload) {
    return crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

function createToken(studentId) {
    const payload = encode({ studentId, exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS });
    return `${payload}.${sign(payload)}`;
}

function verifyToken(token) {
    const [payload, signature] = String(token || "").split(".");
    if (!payload || !signature) return null;

    const expected = Buffer.from(sign(payload));
    const supplied = Buffer.from(signature);
    if (expected.length !== supplied.length || !crypto.timingSafeEqual(expected, supplied)) return null;

    try {
        const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
        if (!decoded.studentId || decoded.exp <= Math.floor(Date.now() / 1000)) return null;
        return decoded;
    } catch {
        return null;
    }
}

module.exports = { createToken, verifyToken };
