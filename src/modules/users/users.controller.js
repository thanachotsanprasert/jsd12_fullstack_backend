import { User } from "./user.model.js";

// MongoDB

const userResponse = (doc) => {
    const user = doc.toObject();
    delete user.password;
    return user;
};

export const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        return res.status(200).json({ success: true, data: users });
    } catch (error) {
        return res.status(400).json({ success: false, error: error });
    }
};

export const createUser = async (req, res) => {
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
};

export const updateUser = async (req, res) => {
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
        const doc = await User.findByIdAndUpdate(req.params.id, updates, {
            // new: true,
            returnDocument: "after",
            runValidators: true,
        });

        if (!doc) {
            return res
                .status(404)
                .json({ success: false, error: "Use not found" });
        }

        return res.status(200).json({ success: true, data: doc });
    } catch (err) {
        return res.status(400).json({ success: false, error: err });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const doc = await User.findByIdAndDelete(req.params.id);

        if (!doc) {
            return res
                .status(404)
                .json({ success: false, error: "User not found" });
        }

        return res.status(200).json({ success: true, data: doc });
    } catch (err) {
        return res.status(400).json({ success: false, error: err });
    }
};
