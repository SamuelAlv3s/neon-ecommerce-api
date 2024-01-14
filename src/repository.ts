import { eq } from "drizzle-orm";
import { db } from "./connection";
import { OrderItem, order_items, orders, products } from "./db/schema";

async function getAllProducts() {
  try {
    const rows = await db.select().from(products);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getProductById(id: string) {
  try {
    const rows = await db.select().from(products).where(eq(products.id, +id));
    return rows[0];
  } catch (error) {
    throw error;
  }
}

async function createOrder(email: string, orderData: any[]) {
  try {
    const order = await db.transaction(async (trx) => {
      const [newOrder] = await trx
        .insert(orders)
        .values({ customer_email: email })
        .returning();
      const productPrices = await Promise.all(
        orderData.map(async (orderItem: any) => {
          const [res] = await db
            .select()
            .from(products)
            .where(eq(products.id, +orderItem.product_id));
          return res.product_price;
        })
      );

      const orderProducts = await Promise.all(
        orderData.map(async (orderItem: any, index: number) => {
          const total = (+productPrices[index] * +orderItem.quantity).toFixed(
            2
          );
          const [orderProduct] = await trx
            .insert(order_items)
            .values({
              order_id: newOrder.id,
              product_id: orderItem.product_id,
              quantity: orderItem.quantity,
              total: +total,
            })
            .returning();
          return orderProduct;
        })
      );

      // Update the total price of the order
      const total = orderProducts.reduce((acc: number, curr: OrderItem) => {
        return acc + curr.total!;
      }, 0);

      const [updatedOrder] = await trx
        .update(orders)
        .set({ total: Number(total.toFixed(2)) })
        .where(eq(orders.id, newOrder.id))
        .returning();
      return { ...updatedOrder, products: orderProducts };
    });
    return order;
  } catch (err) {
    throw err;
  }
}

export { getAllProducts, getProductById, createOrder };
