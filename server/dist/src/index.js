"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const authMiddleware_1 = require("./middleware/authMiddleware");
const tenantRoutes_1 = __importDefault(require("./routes/tenantRoutes"));
const managerRoutes_1 = __importDefault(require("./routes/managerRoutes"));
/*ROUTE IMPORT*/
/*CONFIGURATION*/
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
/*ROUTES*/
app.get('/', (req, res, _next) => {
    res.send('This is home');
});
app.use("/tenants", (0, authMiddleware_1.authMiddleware)(["tenant"]), tenantRoutes_1.default);
app.use("/managers", (0, authMiddleware_1.authMiddleware)(["manager"]), managerRoutes_1.default);
/*SERVER*/
const port = process.env.PORT || 3002;
app.listen(port, () => {
    console.log(`server running on port:${port}`);
});
//# sourceMappingURL=index.js.map