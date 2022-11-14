/* eslint-disable */

import sum from 'lodash/sum';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';

import decode from 'jwt-decode';

// @mui
import { Grid, Card, Button, CardHeader, Typography } from '@mui/material';
// redux
import { useDispatch, useSelector } from '../../../../redux/store';
import {
  deleteCart,
  onNextStep,
  applyDiscount,
  increaseQuantity,
  decreaseQuantity,
} from '../../../../redux/slices/product';
// routes
import { PATH_DASHBOARD } from '../../../../routes/paths';
// components
import Iconify from '../../../../components/Iconify';
import Scrollbar from '../../../../components/Scrollbar';
import EmptyContent from '../../../../components/EmptyContent';
//
import CheckoutSummary from './CheckoutSummary';
import CheckoutProductList from './CheckoutProductList';

import { BID_API, PAYMENT_API } from '../../../../config';


// ----------------------------------------------------------------------

export default function CheckoutCart() {
  const dispatch = useDispatch();

  const { checkout } = useSelector((state) => state.product);

  const { cart, total, subtotal, itemId } = checkout;

  const totalItems = sum(cart.map((item) => item.quantity));

  const isEmptyCart = cart.length === 0;

  const accessToken = window.localStorage.getItem('accessToken');
  const { email } = decode(accessToken);

  const handleDeleteCart = (productId) => {
    dispatch(deleteCart(productId));
  };

  const checkoutSession = async () => {
    await axios.post(PAYMENT_API + '/payment/create-checkout-session', {
      data: cart,
    }).then((res) => {
      const body = res.data;
      console.log(body);
      window.location.href = body.url
    });
    const temp = {
      'user_id': email,
      'item_id' : cart[0].code,
      'bid_amount' : subtotal
    }

    console.log(temp);

    await axios.post(BID_API + '/bid', {

      'user_id': email,
      'item_id' : cart[0].code,
      'bid_amount' : subtotal,

    }).catch((err) => {
      console.log(err);
    });
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card sx={{ mb: 3 }}>
          <CardHeader
            title={
              <Typography variant="h6">
                Confirm Bid
                <Typography component="span" sx={{ color: 'text.secondary' }}>
                  &nbsp;({totalItems} item)
                </Typography>
              </Typography>
            }
            sx={{ mb: 3 }}
          />

          {!isEmptyCart ? (
            <Scrollbar>
              <CheckoutProductList
                products={cart}
                onDelete={handleDeleteCart}
              // onIncreaseQuantity={handleIncreaseQuantity}
              // onDecreaseQuantity={handleDecreaseQuantity}
              />
            </Scrollbar>
          ) : (
            <EmptyContent
              title="Cart is empty"
              description="Look like you have no items in your shopping cart."
              img="https://minimal-assets-api.vercel.app/assets/illustrations/illustration_empty_cart.svg"
            />
          )}
        </Card>

        <Button
          color="inherit"
          component={RouterLink}
          to={PATH_DASHBOARD.eCommerce.root}
          startIcon={<Iconify icon={'eva:arrow-ios-back-fill'} />}
        >
          Continue Shopping
        </Button>
      </Grid>

      <Grid item xs={12} md={4}>
        <CheckoutSummary
          enableDiscount
          total={total}
          subtotal={subtotal}
        />
        <Button
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          disabled={cart.length === 0}
          onClick={checkoutSession}
        >
          Check Out
        </Button>

        {/* <form action="http://localhost:4242/create-checkout-session" method="POST">
              <button type="submit">Checkout</button>
        </form> */}
      </Grid>
    </Grid>
  );
}
