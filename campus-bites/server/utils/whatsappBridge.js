const { sendWhatsAppMessage, getMessageTemplate } = require('./whatsapp');

const setupWhatsAppBridge = (io) => {
    io.on('connection', (socket) => {
        socket.on('order-status-changed', async (data) => {
            if (data.phone && data.status) {
                const message = getMessageTemplate(data.status, { _id: data.orderId, user: { name: data.customerName } });
                await sendWhatsAppMessage(data.phone, message);
            }
        });

        socket.on('send-whatsapp', async (data) => {
            if (data.phone && data.message) {
                await sendWhatsAppMessage(data.phone, data.message);
            }
        });
    });

    console.log('WhatsApp bridge initialized');
};

module.exports = { setupWhatsAppBridge };
