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

export const router = Router();

// mongoDB api/v2

router.get("/", getNotes);

router.post("/", createNote);

router.put("/:id", updateNote);

router.delete("/:id", deleteNote);

// Supabase / PostgreSQL routes (/api/v2/notes/pg)

router.get("/pg", getNotesPG);

router.post("/pg", createNotePG);

router.put("/pg/:id", updateNotePG);

router.delete("/pg/:id", deleteNotePG);
