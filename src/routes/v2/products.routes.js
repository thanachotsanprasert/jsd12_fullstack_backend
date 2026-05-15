import { Router } from "express";

import { products } from "../../fakeData/fakeProducts.js";

export const router = Router();

router.get("/", (req, res) => {
    res.json(products);
});

router.post("/", (req, res) => {
    const { name, price, category, inStock, description } = req.body || {};

    if (!name || price === undefined) {
        return res.status(400).json({ error: "name and price are required" });
    }

    const nextID = String(
        (products.reduce((max, p) => Math.max(max, Number(p.id)), 0) || 0) + 1,
    );

    const newProduct = {
        id: nextID,
        name,
        price,
        category: category || "Uncategorized",
        inStock: inStock !== undefined ? inStock : true, // if null defalut true
        description: description || "",
    };

    products.push(newProduct);
    return res.status(201).json(newProduct);
});

router.put("/:id", (req, res) => {
    const product = products.find((p) => p.id === String(req.params.id));

    if (!product) {
        return res.status(404).json({ error: "not found" });
    }

    const { name, price, category, inStock, description } = req.body || {};

    if (
        !name ||
        price === undefined ||
        !category ||
        !description ||
        inStock === undefined
    ) {
        return res.status(400).json({
            error: "name, price, category, inStock and description are required!",
        });
    }

    product.name = name;
    product.price = price;
    product.category = category;
    product.inStock = inStock;
    product.description = description;

    return res.status(200).json(product);
});

router.delete("/:id", (req, res) => {
    const productIndex = products.findIndex(
        (p) => p.id === String(req.params.id),
    );

    if (productIndex === -1) {
        return res.status(404).json({ error: "not found" });
    }

    const deletedProduct = products.splice(productIndex, 1)[0];

    return res.status(200).json(deletedProduct);
});
