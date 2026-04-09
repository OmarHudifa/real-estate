import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../../database/drizzle";
import { manager, property, location } from "../../database/schema";

// GET manager by cognitoId
export const getManager = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cognitoId } = req.params;
    if (!cognitoId) {
      res.status(400).json({ message: "Missing cognitoId param" });
      return;
    }
    //console.log("cog id: ",cognitoId)
    //console.log("manager cog id",manager.cognitoId)
   

    const result = await db
      .select()
      .from(manager)
      .where(eq(manager.cognitoId, cognitoId))
      .limit(1);

    const foundManager = result[0]; // safer than destructuring

    if (!foundManager) {
      res.status(404).json({ message: "Manager not found" });
      return;
    }

    res.json(foundManager);
  } catch (error: any) {
    console.error("DB error in getManager:", error);
    res.status(500).json({ message: `Error retrieving manager: ${error.message}` });
  }
};


// CREATE manager
export const createManager = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cognitoId, name, email, phoneNumber } = req.body;

    if (!cognitoId || !name || !email || !phoneNumber) {
     res.status(400).json({ message: "Missing required fields" });
      return 
    }

    const [newManager] = await db
      .insert(manager)
      .values({ cognitoId, name, email, phoneNumber })
      .returning();

    res.status(201).json(newManager)
  } catch (err: any) {
    if (err.code === "23505") { // unique violation
      res.status(409).json({ message: "Manager already exists" });
    } else {
      res.status(500).json({ message: `Error creating manager: ${err.message}` });
    }
  }
};

// UPDATE manager
export const updateManager = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cognitoId } = req.params;
    const { name, email, phoneNumber } = req.body;

    if (!cognitoId) 
    { res.status(400).json({ message: "Missing cognitoId param" });
  return
  }

    const [updatedManager] = await db
      .update(manager)
      .set({ name, email, phoneNumber })
      .where(eq(manager.cognitoId, cognitoId))
      .returning();

    if (!updatedManager) { res.status(404).json({ message: "Manager not found" });
  return
  }

    res.json(updatedManager);
  } catch (err: any) {
    res.status(500).json({ message: `Error updating manager: ${err.message}` });
  }
};

// GET properties for a manager
export const getManagerProperties = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cognitoId } = req.params;
    if (!cognitoId) { res.status(400).json({ message: "Missing cognitoId param" });
  return
  }

    const propertiesWithLocation = await db
      .select({
        propertyId: property.id,
        name: property.name,
        coordinates: location.coordinates,
        address: location.address,
        city: location.city,
        state: location.state,
        country: location.country,
        postalCode: location.postalCode,
      })
      .from(property)
      .leftJoin(location, eq(property.locationId, location.id))
      .where(eq(property.managerCognitoId, cognitoId));

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

    
  } catch (err: any) {
    res.status(500).json({ message: `Error retrieving manager properties: ${err.message}` });
  }
};
