import { Router } from "express";
import {
    getNotes,
    createNote,
    updateNote,
    deleteNote,
    getNotesPG,
    createNotePG,
    updateNotePG,
    deleteNotePG,
} from "../../modules/notes/notes.v2.controller.js";
import { protect } from "../../middlewares/auth.js";

export const router = Router();

// mongoDB api/v2

router.get("/", getNotes);

router.post("/", protect, createNote);

router.put("/:id", protect, updateNote);

router.delete("/:id", protect, deleteNote);

// Supabase / PostgreSQL routes (/api/v2/notes/pg)

router.get("/pg", getNotesPG);

router.post("/pg", protect, createNotePG);

router.put("/pg/:id", protect, updateNotePG);

router.delete("/pg/:id", protect, deleteNotePG);
