import { Router } from "express";

import {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    getUsersPG,
    createUserPG,
    updateUserPG,
    deleteUserPG,
} from "../../modules/users/users.v2.controller.js";

export const router = Router();

// mongoDB api/v2

router.get("/", getUsers);

router.post("/", createUser);

router.put("/:id", updateUser);

router.delete("/:id", deleteUser);

// Supabase / PostgreSQL routes (/api/v2/users/pg)
// Password is excluded from SELECT.

router.get("/pg", getUsersPG);

router.post("/pg", createUserPG);

router.put("/pg/:id", updateUserPG);

router.delete("/pg/:id", deleteUserPG);
