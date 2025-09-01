import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../../database/dizzle"; // your drizzle db instance
import { tenant,tenantFavorites } from "../../database/schema"; // your schema definitions

export const getTenant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cognitoId } = req.params;

     if (!cognitoId) {
      res.status(400).json({ message: "Missing cognitoId param" });
      return;
    }

    // Fetch tenant with favorites (Drizzle style)
    const newTenant = await db.query.tenant.findFirst({
      where: eq(tenant.cognitoId, cognitoId),
      with: {
        tenantFavorites: true,
      },
    });

    if (newTenant) {
      res.json(newTenant);
    } else {
      res.status(404).json({ message: "Tenant not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: `Error retrieving tenant: ${error.message}` });
  }
};


export const createTenant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cognitoId,name,email,phoneNumber } = req.body;

    const newTenant = await await db.insert(tenant).values({
      cognitoId,
      name,
      email,
      phoneNumber
      });
      res.status(201).json(newTenant);
    
  } catch (error: any) {
    res.status(500).json({ message: `Error creating tenant: ${error.message}` });
  }
};
