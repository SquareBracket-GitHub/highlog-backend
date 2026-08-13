const { verifyToken } = require("../utils/token");

function authenticate(req, res, next) {
    const authorization = req.get("authorization") || "";
    const [scheme, token] = authorization.split(" ");
    const payload = scheme === "Bearer" ? verifyToken(token) : null;

    if (!payload) {
        return res.status(401).json({ result: "ERROR", error: "Authentication required" });
    }

    req.auth = { studentId: payload.studentId };
    next();
}

module.exports = authenticate;
