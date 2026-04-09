"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getManagerProperties = exports.updateManager = exports.createManager = exports.getManager = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_1 = require("../../database/drizzle");
const schema_1 = require("../../database/schema");
// GET manager by cognitoId
const getManager = async (req, res) => {
    try {
        const { cognitoId } = req.params;
        if (!cognitoId) {
            res.status(400).json({ message: "Missing cognitoId param" });
            return;
        }
        //console.log("cog id: ",cognitoId)
        //console.log("manager cog id",manager.cognitoId)
        const result = await drizzle_1.db
            .select()
            .from(schema_1.manager)
            .where((0, drizzle_orm_1.eq)(schema_1.manager.cognitoId, cognitoId))
            .limit(1);
        const foundManager = result[0]; // safer than destructuring
        if (!foundManager) {
            res.status(404).json({ message: "Manager not found" });
            return;
        }
        res.json(foundManager);
    }
    catch (error) {
        console.error("DB error in getManager:", error);
        res.status(500).json({ message: `Error retrieving manager: ${error.message}` });
    }
};
exports.getManager = getManager;
// CREATE manager
const createManager = async (req, res) => {
    try {
        const { cognitoId, name, email, phoneNumber } = req.body;
        if (!cognitoId || !name || !email || !phoneNumber) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }
        const [newManager] = await drizzle_1.db
            .insert(schema_1.manager)
            .values({ cognitoId, name, email, phoneNumber })
            .returning();
        res.status(201).json(newManager);
    }
    catch (err) {
        if (err.code === "23505") { // unique violation
            res.status(409).json({ message: "Manager already exists" });
        }
        else {
            res.status(500).json({ message: `Error creating manager: ${err.message}` });
        }
    }
};
exports.createManager = createManager;
// UPDATE manager
const updateManager = async (req, res) => {
    try {
        const { cognitoId } = req.params;
        const { name, email, phoneNumber } = req.body;
        if (!cognitoId) {
            res.status(400).json({ message: "Missing cognitoId param" });
            return;
        }
        const [updatedManager] = await drizzle_1.db
            .update(schema_1.manager)
            .set({ name, email, phoneNumber })
            .where((0, drizzle_orm_1.eq)(schema_1.manager.cognitoId, cognitoId))
            .returning();
        if (!updatedManager) {
            res.status(404).json({ message: "Manager not found" });
            return;
        }
        res.json(updatedManager);
    }
    catch (err) {
        res.status(500).json({ message: `Error updating manager: ${err.message}` });
    }
};
exports.updateManager = updateManager;
// GET properties for a manager
const getManagerProperties = async (req, res) => {
    try {
        const { cognitoId } = req.params;
        if (!cognitoId) {
            res.status(400).json({ message: "Missing cognitoId param" });
            return;
        }
        const propertiesWithLocation = await drizzle_1.db
            .select({
            propertyId: schema_1.property.id,
            name: schema_1.property.name,
            coordinates: schema_1.location.coordinates,
            address: schema_1.location.address,
            city: schema_1.location.city,
            state: schema_1.location.state,
            country: schema_1.location.country,
            postalCode: schema_1.location.postalCode,
        })
            .from(schema_1.property)
            .leftJoin(schema_1.location, (0, drizzle_orm_1.eq)(schema_1.property.locationId, schema_1.location.id))
            .where((0, drizzle_orm_1.eq)(schema_1.property.managerCognitoId, cognitoId));
        /* Format coordinates as GeoJSON
        const formattedProperties = propertiesWithLocation.map((p) => {
          let longitude = null;
          let latitude = null;
          if (p.coordinates) {
            const coords = p.coordinates.replace("POINT(", "").replace(")", "").split(" ");
            longitude = parseFloat(coords[0]);
            latitude = parseFloat(coords[1]);
          }
          return { ...p, coordinates: { longitude, latitude } };
        });
        res.json(formattedProperties);
        */
    }
    catch (err) {
        res.status(500).json({ message: `Error retrieving manager properties: ${err.message}` });
    }
};
exports.getManagerProperties = getManagerProperties;
//# sourceMappingURL=managerControllers.js.map