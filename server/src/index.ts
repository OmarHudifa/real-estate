const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
import type { Request, Response, NextFunction } from 'express';
import { authMiddleware } from './middleware/authMiddleware';
import tenantRoutes from "./routes/tenantRoutes"
import managerRoutes from "./routes/managerRoutes"

/*ROUTE IMPORT*/

/*CONFIGURATION*/
dotenv.config()
const app=express()

app.use(express.json())
app.use(helmet())
app.use(helmet.crossOriginResourcePolicy({policy:"cross-origin"}))
app.use(morgan("common"))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))
//app.use(cors())
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

/*ROUTES*/
app.get('/',(req:Request,res:Response, _next: NextFunction)=>{
    res.send('This is home')
})
app.use("/tenants",authMiddleware(["tenant"]),tenantRoutes)
app.use("/managers",authMiddleware(["manager"]),managerRoutes)


app.get("/managers/:cognitoId", (req:Request, res:Response) => {
  res.json({ test: "ok", cognitoId: req.params.cognitoId });
});

/*SERVER*/
const port=process.env.PORT || 3001
app.listen(port,()=>{
    console.log(`server running on port:${port}`)
})