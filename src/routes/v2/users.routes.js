import { Router } from "express";
import { User } from "../../modules/users/user.model.js";
import { supabase } from "../../config/supabase.js";

export const router = Router();

const userResponse = (doc) => {
    const user = doc.toObject();
    delete user.password;
    return user;
};

// mongoDB api/v2

router.get("/", async (req, res) => {
    try {
        const users = await User.find();
        return res.status(200).json({ success: true, data: users });
    } catch (error) {
        return res.status(400).json({ success: false, error: error });
    }
});

router.post("/", async (req, res) => {
    const { username, email, password, role } = req.body || {};

    if (!username || !email || !password) {
        const err = new Error("username and email are required");
        err.name = "validationError";
        err.status = 400;
        return res.status(400).json({ success: false, error: err });
    }

    try {
        const doc = await User.create({ username, email, password, role });
        return res.status(201).json({ success: true, data: userResponse(doc) });
    } catch (err) {
        return res.status(400).json({ success: false, error: err });
    }
});

router.put("/:id", async (req, res) => {
    const user = users.find((u) => u.id === String(req.params.id));

    if (!user) {
        return res.status(404).json({ error: "not found" });
    }

    const { username, email, password } = req.body || {};

    if (!username || !email || !password) {
        return res
            .status(400)
            .json({ error: "username, email and password are require!" });
    }

    user.username = username;
    user.email = email;
    user.password = password;

    return res.status(200).json(user);
});

router.delete("/:id", async (req, res) => {
    const userIndex = users.findIndex((u) => u.id === String(req.params.id));

    if (userIndex === -1) {
        return res.status(404).json({ error: "not found" });
    }

    const deletedUser = users.splice(userIndex, 1)[0];

    return res.status(200).json(deletedUser);
});

// supabase api/v2

const PG_SELECT = "id, username, email, role, created_at, updated_at";

router.get("/pg", async (req, res) => {
    try {
        const { data, error } = await supabase.from("users").select(PG_SELECT);

        if (error) throw error;

        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
});

router.post("/pg", async (req, res) => {
    const { username, email, password, role } = req.body || {};

    if (!username || !email || !password) {
        return res.status(400).json({
            success: false,
            error: "username, email, and password are required",
        });
    }

    try {
        const { data, error } = await supabase
            .from("users")
            .insert({ username, email, password, role: role || "user" })
            .select(PG_SELECT)
            .single();

        if (error) throw error;

        return res.status(201).json({ success: true, data });
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
});

router.put("/pg/:id", async (req, res) => {
    const { id } = req.params;

    const { username, email, password, role } = req.body || {};

    const updates = {};
    if (username !== undefined) updates.username = username;
    if (email !== undefined) updates.email = email;
    if (password !== undefined) updates.password = password;
    if (role !== undefined) updates.role = role;

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({
            success: false,
            error: "At least one field is required to update",
        });
    }

    try {
        const { data, error } = await supabase
            .from("users")
            .update(updates)
            .eq("id", id) // const { id } = req.params; ln.118
            .select(PG_SELECT)
            .single();

        if (error) throw error;

        if (!data || data.length === 0) {
            return res
                .status(404)
                .json({ success: false, error: "User not found" });
        }

        return res.status(200).json({ success: true, data: data[0] });
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
});

router.delete("/pg/:id", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("users")
            .delete()
            .eq("id", req.params.id)
            .select("id, username, email, role");

        if (error) throw error;

        if (!data || data.length === 0) {
            return res
                .status(404)
                .json({ success: false, error: "User not found" });
        }
        return res.status(200).json({ success: true, data: data[0] });
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
});
