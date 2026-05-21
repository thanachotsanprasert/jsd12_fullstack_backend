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
import { protect, authorize } from "../../middlewares/auth.js";

export const router = Router();

// mongoDB api/v2

router.get("/", getProducts);

router.post("/", protect, authorize("admin"), createProduct);

router.put("/:id", protect, authorize("admin"), updateProduct);

router.delete("/:id", protect, authorize("admin"), deleteProduct);

// Supabase / PostgreSQL routes (/api/v2/products/pg)

router.get("/pg", getProductsPG);

router.post("/pg", protect, authorize("admin"), createProductPG);

router.put("/pg/:id", protect, authorize("admin"), updateProductPG);

router.delete("/pg/:id", protect, authorize("admin"), deleteProductPG);
