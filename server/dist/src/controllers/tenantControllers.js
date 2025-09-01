"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTenant = exports.getTenant = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const dizzle_1 = require("../../database/dizzle"); // your drizzle db instance
const schema_1 = require("../../database/schema"); // your schema definitions
const getTenant = async (req, res) => {
    try {
        const { cognitoId } = req.params;
        if (!cognitoId) {
            res.status(400).json({ message: "Missing cognitoId param" });
            return;
        }
        // Fetch tenant with favorites (Drizzle style)
        const newTenant = await dizzle_1.db.query.tenant.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.tenant.cognitoId, cognitoId),
            with: {
                tenantFavorites: true,
            },
        });
        if (newTenant) {
            res.json(newTenant);
        }
        else {
            res.status(404).json({ message: "Tenant not found" });
        }
    }
    catch (error) {
        res.status(500).json({ message: `Error retrieving tenant: ${error.message}` });
    }
};
exports.getTenant = getTenant;
const createTenant = async (req, res) => {
    try {
        const { cognitoId, name, email, phoneNumber } = req.body;
        const newTenant = await await dizzle_1.db.insert(schema_1.tenant).values({
            cognitoId,
            name,
            email,
            phoneNumber
        });
        res.status(201).json(newTenant);
    }
    catch (error) {
        res.status(500).json({ message: `Error creating tenant: ${error.message}` });
    }
};
exports.createTenant = createTenant;
//# sourceMappingURL=tenantControllers.js.map