// backend/routes/userRoutes.ts
import express from "express";
import { signUp, login, getAllUsers, updateUserStatus } from "../controller/userController";

const router = express.Router();

router.post("/signup", signUp);
router.post("/login", login);
router.get("/", getAllUsers);
router.put("/updateUserStatus", updateUserStatus);

export default router;
