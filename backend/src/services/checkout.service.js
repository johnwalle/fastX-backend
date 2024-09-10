const axios = require("axios");
const config = require("../config/config");
const ApiError = require("../utils/apiError");
const httpStatus = require("http-status");


const checkout = async (order, user) => {
    try {
        // Validate user details
        if (!user || !user.fullName || !user.email) {
            throw new Error('User details are missing');
        }

        // Validate order details
        if (!order || !order.total_amount) {
            throw new Error('Order details are missing');
        }

        // Split the user's full name into first and last names
        const nameParts = user.fullName.split(' ');
        const first = nameParts[0];
        const last = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

        // Generate a unique transaction reference
        const timestamp = Date.now();
        const randomNum = Math.floor(Math.random() * 1000);
        const tx_ref = `${first.toLowerCase()}_${last.toLowerCase()}_${timestamp}_${randomNum}`;

        console.log('tx_reference:', tx_ref);
        console.log('User ID:', user.id);

        // Prepare the data to send to Chapa
        const requestData = {
            amount: order.total_amount,
            currency: 'ETB',
            email: user.email,
            first_name: first,
            last_name: last,
            tx_ref: tx_ref,
            callback_url: `http://localhost:8000/api/checkout/verify/${user.id}`, // Ensure this URL is reachable from Chapa
            return_url: 'http://localhost:3000/order/confirmation',
        };

        // Send the request to Chapa
        const response = await axios.post('https://api.chapa.co/v1/transaction/initialize', requestData, {
            headers: {
                Authorization: `Bearer ${config.chapaPayment.secretKey}`,
                'Content-Type': 'application/json',
            },
        });

        console.log('Chapa response:', response.data);

        // Check if the response status from Chapa is successful
        if (response.data.status === 'success') {
            // Update the order's tx_ref and save it to the database
            order.tx_ref = tx_ref;
            await order.save(); // Ensure `order` is a Mongoose document
        } else {
            // Handle failed initialization response
            throw new Error('Failed to initialize payment with Chapa');
        }

        // Return the response data from Chapa
        return response.data;
    } catch (error) {
        // Log any errors during the checkout process
        console.error('Error during checkout:', error.message);
        throw new Error('Checkout process failed. Please try again.');
    }
};



const verifyCheckout = async (cart) => {
    const options = {
        method: 'GET',
        url: `https://api.chapa.co/v1/transaction/verify/${cart}`,
        headers: {
            'Authorization': `Bearer ${config.chapaPayment.secretKey}`
        }
    };

    const response = await axios(options);
    return response.data;

}


module.exports = { checkout, verifyCheckout };