import { Product } from "./product.model.js";
import { supabase } from "../../config/supabase.js";

// MongoDB

export const getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        return res.status(200).json({ success: true, data: products });
    } catch (error) {
        return res.status(400).json({ success: false, error: error });
    }
};

export const createProduct = async (req, res) => {
    const { name, price, category, inStock, description } = req.body || {};

    if (!name || price === undefined || !category) {
        const err = new Error("name, price, and category are required");
        err.name = "validationError";
        err.status = 400;
        return res.status(400).json({ success: false, error: err });
    }

    try {
        const doc = await Product.create({
            name,
            price,
            category,
            inStock,
            description,
        });
        return res.status(201).json({ success: true, data: doc });
    } catch (err) {
        return res.status(400).json({ success: false, error: err });
    }
};

export const updateProduct = async (req, res) => {
    const { name, price, category, inStock, description } = req.body || {};
    const updates = {};

    if (name !== undefined) updates.name = name;
    if (price !== undefined) updates.price = price;
    if (category !== undefined) updates.category = category;
    if (inStock !== undefined) updates.inStock = inStock;
    if (description !== undefined) updates.description = description;

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({
            success: false,
            error: "At least one field is required to update",
        });
    }

    try {
        const doc = await Product.findByIdAndUpdate(req.params.id, updates, {
            returnDocument: "after",
            runValidators: true,
        });

        if (!doc) {
            return res
                .status(404)
                .json({ success: false, error: "Product not found" });
        }

        return res.status(200).json({ success: true, data: doc });
    } catch (err) {
        return res.status(400).json({ success: false, error: err });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const doc = await Product.findByIdAndDelete(req.params.id);

        if (!doc) {
            return res
                .status(404)
                .json({ success: false, error: "Product not found" });
        }

        return res.status(200).json({ success: true, data: doc });
    } catch (err) {
        return res.status(400).json({ success: false, error: err });
    }
};

// Supabase / PostgreSQL routes (/api/v2/products/pg)

const PG_SELECT =
    "id, name, price, category, in_stock, description, created_at, updated_at";

export const getProductsPG = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("products")
            .select(PG_SELECT);

        if (error) throw error;

        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
};

export const createProductPG = async (req, res) => {
    const { name, price, category, inStock, description } = req.body || {};

    if (!name || price === undefined || !category) {
        return res.status(400).json({
            success: false,
            error: "name, price, and category are required",
        });
    }

    try {
        const { data, error } = await supabase
            .from("products")
            .insert({
                name,
                price,
                category,
                in_stock: inStock !== undefined ? inStock : true,
                description: description || "",
            })
            .select(PG_SELECT)
            .single();

        if (error) throw error;

        return res.status(201).json({ success: true, data });
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
};

export const updateProductPG = async (req, res) => {
    const { id } = req.params;
    const { name, price, category, inStock, description } = req.body || {};

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (price !== undefined) updates.price = price;
    if (category !== undefined) updates.category = category;
    if (inStock !== undefined) updates.in_stock = inStock;
    if (description !== undefined) updates.description = description;

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({
            success: false,
            error: "At least one field is required to update",
        });
    }

    try {
        const { data, error } = await supabase
            .from("products")
            .update(updates)
            .eq("id", id)
            .select(PG_SELECT)
            .single();

        if (error) throw error;

        if (!data || data.length === 0) {
            return res
                .status(404)
                .json({ success: false, error: "Product not found" });
        }

        return res.status(200).json({ success: true, data: data[0] });
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
};

export const deleteProductPG = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("products")
            .delete()
            .eq("id", req.params.id)
            .select("id, name, price, category");

        if (error) throw error;

        if (!data || data.length === 0) {
            return res
                .status(404)
                .json({ success: false, error: "Product not found" });
        }
        return res.status(200).json({ success: true, data: data[0] });
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
};
