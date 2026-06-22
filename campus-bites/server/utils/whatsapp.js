const axios = require('axios');

// Configuration
const OPENWA_API_URL = (process.env.OPENWA_API_URL || 'http://localhost:2785').replace(/\/api\/?$/, '');
const OPENWA_API_KEY = process.env.OPENWA_API_KEY || 'YOUR_API_KEY_HERE';
const OPENWA_SESSION_ID = process.env.OPENWA_SESSION_ID || 'default'; // Replace with your session ID

/**
 * Send a WhatsApp message using OpenWA
 * @param {string} customerPhone - Phone number without +, e.g., '919876543210'
 * @param {string} messageText - The message to send
 */
const sendWhatsAppMessage = async (customerPhone, messageText) => {
    try {
        if (!customerPhone) {
            console.warn('WhatsApp Send Error: No phone number provided');
            return;
        }

        // Format phone to chatId: add @c.us suffix
        const chatId = `${customerPhone}@c.us`;

        const response = await axios.post(
            `${OPENWA_API_URL}/api/sessions/${OPENWA_SESSION_ID}/messages/send-text`,
            {
                chatId: chatId,
                text: messageText
            },
            {
                headers: {
                    'X-API-Key': OPENWA_API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log(`WhatsApp message sent to ${customerPhone} successfully. Message ID:`, response.data?.messageId || 'Success');
        return response.data;
    } catch (error) {
        console.error(`WhatsApp Send Error for ${customerPhone}:`, error?.response?.data || error.message);
        // Do not throw error so it doesn't break the main flow (like placing an order)
        return null;
    }
};

/**
 * Generate a message template based on order status
 */
const getMessageTemplate = (status, order) => {
    const customerName = order.user?.name || 'Customer';
    const orderId = order._id.toString().slice(-6).toUpperCase(); // using last 6 chars of ID

    switch (status) {
        case 'shipped':
        case 'ready': // Depending on your system terminology
            return `Hello ${customerName}, good news! Your order #${orderId} is ready and on its way.`;
        case 'delivered':
        case 'completed':
            return `Hello ${customerName}, your order #${orderId} has been delivered/completed. Enjoy your meal!`;
        case 'cancelled':
            return `Hello ${customerName}, we're sorry but your order #${orderId} has been cancelled.`;
        default:
            return `Hello ${customerName}, your order #${orderId} status has been updated to: ${status}.`;
    }
};

module.exports = {
    sendWhatsAppMessage,
    getMessageTemplate
};
