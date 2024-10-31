const cartService = require("../services/cart.service")
const chapaService = require('../services/checkout.service')
const userService = require('../services/user.service')
const orderService = require('../services/order.service')
const restaurantService = require('../services/restaurant.service.js')



const createOrder = async (req, res) => {
    console.log('order data', req.body);
    const { delivery_instructions } = req.body;

    try {
        const user = req.user;
        const cart = await cartService.getCartByUserId(user.id);

        // Check if the cart exists
        if (!cart) {
            return res.status(404).send("No cart found!");
        }

        // Check if the cart has items
        if (cart.items.length === 0) {
            return res.status(404).json("No items found in the cart");
        }
        console.log('cartId', cart._id)


        // Check if an order already exists with the current cartId
        const existingOrder = await orderService.getOrderByCartId(cart._id);

        //get restaurnat id

        const restaurantID = cart.items[0].restaurant;

        //get restaurant name by its id

        const restaurantData = await restaurantService.getRestaurantById(restaurantID)
        const restaurantName = restaurantData?.name
        console.log('restanurant name', restaurantName);


        console.log('existingOrder', existingOrder)

        // If an existing order is found, use it instead of creating a new one
        let order;
        if (existingOrder) {
            console.log('Order already exists, fetching existing order details.');
            order = existingOrder;
        } else {
            // Set the delivery fee to 100
            const deliveryFee = 100;

            // Create a pending order with cart details before payment verification
            const pendingOrder = {
                user: user.id,
                cartId: cart._id,
                restaurant: restaurantID, // Assuming cart holds a restaurant reference
                restaurantName,
                OrderItems: cart.items,
                delivery_instructions,
                payment_status: 'pending',
                total_price: cart.totalPrice,
                delivery_fee: deliveryFee || 0,
                total_amount: cart.totalPrice + (deliveryFee || 0),
            };

            // Create the new order
            order = await orderService.createOrder(pendingOrder);

            // Check if the order was successfully created before proceeding
            if (!order) {
                return res.status(500).json({ message: 'Failed to create order.' });
            }
        }

        // Initiate payment with the existing or newly created order
        const payment = await chapaService.checkout(order, user);
        console.log("Order payment:", payment);
        return res.status(200).json({ payment, orderId: order._id });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};


const verifyCheckout = async (req, res) => {

    try {
        const { id } = req.params;
        const user = await userService.getUserById(id);

        // Check if the user exists
        if (!user) {
            return res.status(404).json("User Not Found");
        }

        const cart = await cartService.getCartByUserId(id);
        console.log('cart.to.delete', cart)


        // Check if the cart exists
        if (!cart) {
            return res.status(404).send("No cart found!");
        }




        //getting order by cart id
        const order = await orderService.getOrderByCartId(cart._id)


        // Verify the payment
        const result = await chapaService.verifyCheckout(order.tx_ref);

        console.log("Result: " + result.status);

        // Check if the payment is successful
        if (result.status === "success") {

            // Update the payment status to "completed" after successful payment
            await orderService.updatePaymentStatus(order._id, "completed");

            // Clear the user's cart after a successful order
            await cartService.deleteCart(id);

            return res.status(200).json({ message: "Order placed successfully!", result });
        } else {
            // Handle failed verification
            return res.status(400).json({ message: "Payment verification failed!", result });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = { createOrder, verifyCheckout };
