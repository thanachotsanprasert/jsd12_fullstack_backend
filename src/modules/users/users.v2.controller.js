import { User } from "./user.model.js";
import { supabase } from "../../config/supabase.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const signToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || "fallback_secret", {
        expiresIn: "1d",
    });
};

// MongoDB

const userResponse = (doc) => {
    const user = doc.toObject();
    delete user.password;
    return user;
};

export const getUsers = async (req, res, next) => {
    try {
        const users = await User.find();
        return res.status(200).json({ success: true, data: users });
    } catch (err) {
        next(err);
    }
};

export const createUser = async (req, res, next) => {
    const { username, email, password, role } = req.body || {};

    if (!username || !email || !password) {
        const err = new Error("username and email are required");
        err.name = "validationError";
        err.status = 400;
        return res.status(400).json({ success: false, error: err });
    }

    try {
        const newUser = new User({
            username,
            email,
            password,
            role,
        });
        // const hashPassword = await bcrypt.hash(password, 8);
        // const doc = await User.create({
        //     username,
        //     email,
        //     password,
        //     role,
        // });
        // โชว์ log of hashPassword ตอนยิง POST on REST Client
        // console.log("hashed password แล้วจ้า", hashPassword);
        const doc = await newUser.save();
        return res.status(201).json({ success: true, data: userResponse(doc) });
    } catch (err) {
        // return res.status(400).json({ success: false, error: err });
        next(err);
    }
};

export const updateUser = async (req, res, next) => {
    const { username, email, password, role } = req.body || {};

    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res
                .status(404)
                .json({ success: false, error: "User not found" });
        }

        if (username !== undefined) user.username = username;
        if (email !== undefined) user.email = email;
        if (password !== undefined) user.password = password;
        if (role !== undefined) user.role = role;

        const doc = await user.save();
        return res.status(200).json({ success: true, data: userResponse(doc) });
    } catch (err) {
        next(err);
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        const doc = await User.findByIdAndDelete(req.params.id);

        if (!doc) {
            return res
                .status(404)
                .json({ success: false, error: "User not found" });
        }

        return res.status(200).json({ success: true, data: userResponse(doc) });
    } catch (err) {
        // return res.status(400).json({ success: false, error: err });
        next(err);
    }
};

export const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "400:bad request: don't have email or password",
            });
        }

        const userInDB = await User.findOne({ email }).select("+password");

        if (!userInDB) {
            return res.status(401).json({
                success: false,
                message: "401 wrong email",
            });
        }

        const isMatched = await bcrypt.compare(password, userInDB.password);

        if (isMatched === false) {
            return res.status(401).json({
                success: false,
                message: "401 wrong password",
            });
        } else {
            return res.status(200).json({
                success: true,
                message: "200 login done!",
                data: userResponse(userInDB),
            });
        }
    } catch (err) {
        next(err);
    }
};

// Supabase / PostgreSQL routes (/api/v2/users/pg)
// Password is excluded from SELECT.

const PG_SELECT = "id, username, email, role, created_at, updated_at";

export const getUsersPG = async (req, res, next) => {
    try {
        const { data, error } = await supabase.from("users").select(PG_SELECT);

        if (error) throw error;

        return res.status(200).json({ success: true, data });
    } catch (err) {
        // return res.status(400).json({ success: false, error: error.message });
        next(err);
    }
};

export const createUserPG = async (req, res, next) => {
    const { username, email, password, role } = req.body || {};

    if (!username || !email || !password) {
        return res.status(400).json({
            success: false,
            error: "username, email, and password are required",
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 8);
        const { data, error } = await supabase
            .from("users")
            .insert({
                username,
                email,
                password: hashedPassword,
                role: role || "user",
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

export const updateUserPG = async (req, res, next) => {
    const { id } = req.params;

    const { username, email, password, role } = req.body || {};

    const updates = {};
    if (username !== undefined) updates.username = username;
    if (email !== undefined) updates.email = email;
    if (password !== undefined) {
        updates.password = await bcrypt.hash(password, 8);
    }
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

        if (!data) {
            return res
                .status(404)
                .json({ success: false, error: "User not found" });
        }

        return res.status(200).json({ success: true, data: data });
    } catch (err) {
        // return res.status(400).json({ success: false, error: error.message });
        next(err);
    }
};

export const deleteUserPG = async (req, res, next) => {
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
    } catch (err) {
        // return res.status(400).json({ success: false, error: error.message });
        next(err);
    }
};

export const loginUserPG = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const { data: user, error } = await supabase
            .from("users")
            .select("id, username, email, password, role")
            .eq("email", email)
            .single();

        if (error || !user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const isMatched = await bcrypt.compare(password, user.password);

        if (!isMatched) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const userResponse = { ...user };
        delete userResponse.password;

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: userResponse,
        });
    } catch (err) {
        next(err);
    }
};
