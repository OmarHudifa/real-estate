"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createManager = exports.getManager = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const dizzle_1 = require("../../database/dizzle"); // your drizzle db instance
const schema_1 = require("../../database/schema"); // your schema definitions
const getManager = async (req, res) => {
    try {
        const { cognitoId } = req.params;
        if (!cognitoId) {
            res.status(400).json({ message: "Missing cognitoId param" });
            return;
        }
        // Fetch tenant with favorites (Drizzle style)
        const newManager = await dizzle_1.db.query.manager.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.manager.cognitoId, cognitoId),
            with: {
                tenantFavorites: true,
            },
        });
        if (newManager) {
            res.json(newManager);
        }
        else {
            res.status(404).json({ message: "Manager not found" });
        }
        console.log("manager: ", newManager, res.status);
    }
    catch (error) {
        res.status(500).json({ message: `Error retrieving manager: ${error.message}` });
    }
};
exports.getManager = getManager;
const createManager = async (req, res) => {
    try {
        const { cognitoId, name, email, phoneNumber } = req.body;
        const newManager = await await dizzle_1.db.insert(schema_1.manager).values({
            cognitoId,
            name,
            email,
            phoneNumber
        });
        res.status(201).json(newManager);
        console.log(newManager, res.status);
    }
    catch (error) {
        res.status(500).json({ message: `Error creating Manager: ${error.message}` });
    }
};
exports.createManager = createManager;
//# sourceMappingURL=managerControllers.js.map