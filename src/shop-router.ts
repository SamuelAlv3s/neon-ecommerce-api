import express from "express";
import { createOrder, getAllProducts, getProductById } from "./repository";

const router = express.Router();

router.get("/api/products", async (req, res) => {
  try {
    const items = await getAllProducts();
    res.json(items);
  } catch (error) {
    console.error(error);
  }
});

router.get("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const item = await getProductById(id);
    res.json(item);
  } catch (error) {
    console.error(error);
  }
});

router.post("/api/orders", async (req, res) => {
  try {
    const { email, products } = req.body;
    const order = await createOrder(email, products);
    res.json(order);
  } catch (error) {
    console.error(error);
  }
});

export default router;
