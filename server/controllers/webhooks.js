import Stripe from "stripe";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

export const stripeWebhooks = async (request, response) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const sig = request.headers["stripe-signature"];

    let event;

    try {
        event = stripe.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (error) {
        return response.status(400).send(`Webhook Error: ${error.message}`);
    }

    try {
        switch (event.type) {
            case "payment_intent.succeeded": {
                const paymentIntent = event.data.object;
                const sessionList = await stripe.checkout.sessions.list({
                    payment_intent: paymentIntent.id,
                });

                const session = sessionList.data[0];
                const { transactionId, appId } = session.metadata;

                if (appId === 'quickgpt') {
                    const transaction = await Transaction.findOne({ _id: transactionId, isPaid: false });

                    // Update credits in user account
                    await User.updateOne({ _id: transaction.userId }, { $inc: { credits: transaction.credits } });

                    // Update credit Payment status
                    transaction.isPaid = true;
                    await transaction.save();

                    return response.json({ received: true, message: "Payment processed successfully" });
                } else {
                    return response.json({ received: true, message: "Ignored event: Invalid app" });
                }
            }
            default: {
                console.log("Unhandled event type:", event.type);
                return response.json({ received: true, message: "Unhandled event type" });
            }
        }
    } catch (error) {
        console.error("Webhook processing error:", error);
        return response.status(500).json({
            received: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};