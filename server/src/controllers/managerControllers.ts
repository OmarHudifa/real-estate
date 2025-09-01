import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../../database/dizzle"; // your drizzle db instance
import { manager} from "../../database/schema"; // your schema definitions

export const getManager = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cognitoId } = req.params;

     if (!cognitoId) {
      res.status(400).json({ message: "Missing cognitoId param" });
      return;
    }

    // Fetch tenant with favorites (Drizzle style)
    const newManager = await db.query.manager.findFirst({
      where: eq(manager.cognitoId, cognitoId),
      with: {
        tenantFavorites: true,
      },
    });

    if (newManager) {
      res.json(newManager);
    } else {
      res.status(404).json({ message: "Manager not found" }); 
    }

    console.log("manager: ",newManager,res.status)
  } catch (error: any) {
    res.status(500).json({ message: `Error retrieving manager: ${error.message}` });
  }
};


export const createManager = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cognitoId,name,email,phoneNumber } = req.body;

    const newManager = await await db.insert(manager).values({
      cognitoId,
      name,
      email,
      phoneNumber
      });
      res.status(201).json(newManager);
      console.log(newManager,res.status)
    
  } catch (error: any) {
    res.status(500).json({ message: `Error creating Manager: ${error.message}` });
  }
};
