import { Note } from "../../modules/notes/note.model.js";
import { supabase } from "../../config/supabase.js";

// MongoDB
export const getNotes = async (req, res, next) => {
    try {
        const notes = await Note.find();
        return res.status(200).json({ success: true, data: notes });
    } catch (err) {
        // return res.status(400).json({ success: false, error: error });
        next(err);
    }
};

export const createNote = async (req, res, next) => {
    const { title, content, isCompleted } = req.body || {};

    if (!title || !content) {
        const err = new Error("title and content are required");
        err.name = "validationError";
        err.status = 400;
        return res.status(400).json({ success: false, error: err });
    }

    try {
        const doc = await Note.create({
            title,
            content,
            isCompleted,
        });
        return res.status(201).json({ success: true, data: doc });
    } catch (err) {
        // return res.status(400).json({ success: false, error: err });
        next(err);
    }
};

export const updateNote = async (req, res, next) => {
    const { title, content, isCompleted } = req.body || {};
    const updates = {};

    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (isCompleted !== undefined) updates.isCompleted = isCompleted;

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({
            success: false,
            error: "At least one field is required to update",
        });
    }

    try {
        const doc = await Note.findByIdAndUpdate(req.params.id, updates, {
            returnDocument: "after",
            runValidators: true,
        });

        if (!doc) {
            return res
                .status(404)
                .json({ success: false, error: "Note not found" });
        }

        return res.status(200).json({ success: true, data: doc });
    } catch (err) {
        // return res.status(400).json({ success: false, error: err });
        next(err);
    }
};

export const deleteNote = async (req, res, next) => {
    try {
        const doc = await Note.findByIdAndDelete(req.params.id);

        if (!doc) {
            return res
                .status(404)
                .json({ success: false, error: "Note not found" });
        }

        return res.status(200).json({ success: true, data: doc });
    } catch (err) {
        // return res.status(400).json({ success: false, error: err });
        next(err);
    }
};

// Supabase / PostgreSQL routes (/api/v2/notes/pg)

const PG_SELECT =
    "id, title, content, isCompleted:is_completed, created_at, updated_at";

export const getNotesPG = async (req, res, next) => {
    try {
        const { data, error } = await supabase.from("notes").select(PG_SELECT);

        if (error) throw error;

        return res.status(200).json({ success: true, data });
    } catch (err) {
        // return res.status(400).json({ success: false, error: error.message });
        next(err);
    }
};

export const createNotePG = async (req, res, next) => {
    const { title, content, isCompleted } = req.body || {};

    if (!title || !content) {
        return res.status(400).json({
            success: false,
            error: "title and content are required",
        });
    }

    try {
        const { data, error } = await supabase
            .from("notes")
            .insert({
                title,
                content,
                is_completed: isCompleted !== undefined ? isCompleted : false,
            })
            .select(PG_SELECT)
            .single();

        if (error) throw error;

        return res.status(201).json({ success: true, data });
    } catch (err) {
        // return res.status(400).json({ success: false, error: error.message });
        next(err);
    }
};

export const updateNotePG = async (req, res, next) => {
    const { id } = req.params;
    const { title, content, isCompleted } = req.body || {};

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (isCompleted !== undefined) updates.is_completed = isCompleted;

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({
            success: false,
            error: "At least one field is required to update",
        });
    }

    try {
        const { data, error } = await supabase
            .from("notes")
            .update(updates)
            .eq("id", id)
            .select(PG_SELECT)
            .single();

        if (error) throw error;

        if (!data || data === 0) {
            return res
                .status(404)
                .json({ success: false, error: "Note not found" });
        }

        return res.status(200).json({ success: true, data: data });
    } catch (err) {
        // return res.status(400).json({ success: false, error: error.message });
        next(err);
    }
};

export const deleteNotePG = async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from("notes")
            .delete()
            .eq("id", req.params.id)
            .select("id, title, content, is_completed");

        if (error) throw error;

        if (!data || data.length === 0) {
            return res
                .status(404)
                .json({ success: false, error: "Note not found" });
        }
        return res.status(200).json({ success: true, data: data[0] });
    } catch (err) {
        // return res.status(400).json({ success: false, error: error.message });
        next(err);
    }
};
