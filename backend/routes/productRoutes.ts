import express from "express";
import { getAllProducts, createProduct, updateProduct, deleteProduct} from "../controller/productController";

const router = express.Router();

router.post("/create", createProduct);

router.put("/update/:productId", updateProduct);

router.delete("/delete/:productId", deleteProduct);

router.get('/', getAllProducts);


export default router;
