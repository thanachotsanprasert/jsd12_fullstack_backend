import { Router } from "express";
import {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductsPG,
    createProductPG,
    updateProductPG,
    deleteProductPG,
} from "../../modules/products/products.v2.controller.js";

export const router = Router();

// mongoDB api/v2

router.get("/", getProducts);

router.post("/", createProduct);

router.put("/:id", updateProduct);

router.delete("/:id", deleteProduct);

// Supabase / PostgreSQL routes (/api/v2/products/pg)

router.get("/pg", getProductsPG);

router.post("/pg", createProductPG);

router.put("/pg/:id", updateProductPG);

router.delete("/pg/:id", deleteProductPG);
