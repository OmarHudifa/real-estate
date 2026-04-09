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
const propertyRoutes_1 = __importDefault(require("./routes/propertyRoutes"));
const leaseRoutes_1 = __importDefault(require("./routes/leaseRoutes"));
const applicationRoutes_1 = __importDefault(require("./routes/applicationRoutes"));
/*ROUTE IMPORT*/
/*CONFIGURATION*/
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cors())
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
/*ROUTES*/
app.use("application", applicationRoutes_1.default);
app.use("/properties", propertyRoutes_1.default);
app.use("/leases", leaseRoutes_1.default);
app.use("/tenants", (0, authMiddleware_1.authMiddleware)(["tenant"]), tenantRoutes_1.default);
app.use("/managers", (0, authMiddleware_1.authMiddleware)(["manager"]), managerRoutes_1.default);
app.get("/managers/:cognitoId", (req, res) => {
    res.json({ test: "ok", cognitoId: req.params.cognitoId });
});
/*SERVER*/
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`server running on port:${port}`);
});
//# sourceMappingURL=index.js.map