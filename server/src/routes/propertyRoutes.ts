import express from "express"
import{getProperties,getProperty,createProperty} from "../controllers/propertyControllers"
import multer from "multer"
import { authMiddleware } from "../middleware/authMiddleware"


const storage=multer.memoryStorage()
const upload=multer({storage:storage})

const router=express.Router()


router.get("/:id",getProperty)
router.get("/",getProperties)
router.post("/",authMiddleware(["manager"]),upload.array("photos"),createProperty)

export default router