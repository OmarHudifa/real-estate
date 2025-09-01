"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (allowedRules) => {
    return (req, res, next) => {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        try {
            const decode = jsonwebtoken_1.default.decode(token);
            const userRole = decode["custom:role"] || "";
            req.user = {
                id: decode.sub,
                role: userRole
            };
            const hasAccess = allowedRules.includes(userRole.toLocaleLowerCase());
            if (!hasAccess) {
                res.status(403).json({ message: "Access denied" });
                return;
            }
        }
        catch (error) {
            console.error("Failed to decode token:", error);
            res.status(400).json({ message: "Invalid Token" });
            return;
        }
        next();
    };
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=authMiddleware.js.map