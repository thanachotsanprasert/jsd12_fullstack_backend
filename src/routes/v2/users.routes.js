import { Router } from "express";

import {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    loginUser,
    getUsersPG,
    createUserPG,
    updateUserPG,
    deleteUserPG,
    loginUserPG,
} from "../../modules/users/users.v2.controller.js";
import { protect, authorize } from "../../middlewares/auth.js";

export const router = Router();

// mongoDB api/v2

router.get("/", getUsers);

router.post("/", createUser);

router.post("/login", loginUser);

router.put("/:id", protect, updateUser);

router.delete("/:id", protect, authorize("admin"), deleteUser);

// Supabase / PostgreSQL routes (/api/v2/users/pg)
// Password is excluded from SELECT.

router.get("/pg", getUsersPG);

router.post("/pg", createUserPG);

router.post("/pg/login", loginUserPG);

router.put("/pg/:id", protect, updateUserPG);

router.delete("/pg/:id", protect, authorize("admin"), deleteUserPG);
