import Stripe from "stripe";

const REDIRECT_URL = process.env.REDIRECT_URL || "http://localhost:3030";

export const healthcheck = async (req, res) => {
  try {
    const healthcheck = {
      message: "Service OK",
    };
    res.status(200).json(healthcheck);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const checkoutSession = async (req, res) => {
  const stripe = Stripe(
    "sk_test_51JjP7qFwG6YcxwhyHX9ltTf3gGikePStWfyli1SVrgocKFKogX3qtw644SZFn7lUWaVHdhiBKO6X7J47W2GWHjBb005NgJVJFw"
  );
  const { data } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      line_items: data.map((item) => {
        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: item.name,
            },
            unit_amount: parseInt(item.subtotal) * 100,
          },
          quantity: 1,
        };
      }),
      mode: "payment",
      success_url: REDIRECT_URL + "/dashboard/e-commerce/checkout/success",
      cancel_url: REDIRECT_URL + "/dashboard/e-commerce/checkout/cancel",
    });
    res.status(200).json({ url: session.url });
  } catch (error) {
    res.status(500).json({ message: "An error has occured" });
  }
};
