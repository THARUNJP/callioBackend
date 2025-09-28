import { Router } from "express";
import { getAllUser, Login, refreshToken } from "../controller/control.js";
import { authenticateJWT } from "../middelware/middelware.js";

const rout  = Router();


rout.get("/",(req,res)=>{
res.json("api hits base server")
})
rout.post("/login",Login)
rout.get("/users",authenticateJWT,getAllUser)
rout.post("/refresh-token",refreshToken)



export default rout;
