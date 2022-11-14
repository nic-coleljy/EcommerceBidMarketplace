 /* eslint-disable */

import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { sentenceCase } from 'change-case';
import { useNavigate } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import {  useState, useEffect } from 'react';
import axios from 'axios';
// form
import { Controller, useForm } from 'react-hook-form';
// @mui
import { useTheme, styled } from '@mui/material/styles';
import { Box, Link, Stack, Button, Rating, Divider, IconButton, Typography } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../../../routes/paths';
// utils
import { fShortenNumber, fCurrency } from '../../../../utils/formatNumber';

import { BID_API } from '../../../../config';
// components
import Label from '../../../../components/Label';
import Iconify from '../../../../components/Iconify';
import SocialsButton from '../../../../components/SocialsButton';
import { ColorSinglePicker } from '../../../../components/color-utils';
import { FormProvider, RHFSelect, RHFTextField} from '../../../../components/hook-form';


// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  padding: theme.spacing(3),
  [theme.breakpoints.up(1368)]: {
    padding: theme.spacing(5, 8),
  },
}));

// ----------------------------------------------------------------------

ProductDetailsSummary.propTypes = {
  cart: PropTypes.array,
  onAddCart: PropTypes.func,
  onGotoStep: PropTypes.func,
  product: PropTypes.shape({
    available: PropTypes.number,
    colors: PropTypes.arrayOf(PropTypes.string),
    cover: PropTypes.string,
    id: PropTypes.string,
    inventoryType: PropTypes.string,
    name: PropTypes.string,
    price: PropTypes.number,
    priceSale: PropTypes.number,
    sizes: PropTypes.arrayOf(PropTypes.string),
    status: PropTypes.string,
    totalRating: PropTypes.number,
    totalReview: PropTypes.number,
  }),
};

export default function ProductDetailsSummary({ cart, product, onAddCart, onGotoStep, ...other }) {
  const theme = useTheme();

  const navigate = useNavigate();

  console.log(product);
  

  const {
    id,
    name,
    price,
    cover,
    available,
    priceSale,
    totalRating,
    totalReview,
    minBiddingPrice,
    code,
  } = product;
  console.log(code);
  

  // const alreadyProduct = cart.map((item) => item.id).includes(id);

  // const isMaxQuantity = cart.filter((item) => item.id === id).map((item) => item.quantity)[0] >= available;

  const defaultValues = {
    id,
    name,
    cover,
    available,
    price,
    bid: 0,
    quantity: 1,
  };
  const [highestBiddingPrice, setHighestBiddingPrice] = useState(Number(minBiddingPrice.$numberDecimal));
  useEffect(() => {
    const getCurrentBidPrice = async() => {
      const BidDetails ={
              item_id: code,
              offset:0
      }
      try {
        const response = await axios.post(`${BID_API}/bid/top`, BidDetails);
    
        if (response.status === 200) {
          console.log("bid is retrieved");
          console.log(response);
          setHighestBiddingPrice(response.data.bid.bid_amount);
       
        } else if (response.status === 400) {
          console.log("No bids for this item");   
        } else {
          throw new Error("Unable to fetch highest bid price.");
        }
        
        } catch(error) {
            console.log(error);
            // throw new Error ("Unable to fetch highest bid price.");
        }
        console.log(BidDetails);
    }
    getCurrentBidPrice();
  },[])
  console.log(highestBiddingPrice);
  const BidSchema = Yup.object().shape({
    // bid: Yup.string().required('A bid is required.'),
    bid: Yup.number().moreThan(highestBiddingPrice, 'A bid must be higher than the current bid price.')
  });
  const methods = useForm({
    resolver: yupResolver(BidSchema),
    defaultValues,
  });

  const { reset, watch, control, getValues, setValue, handleSubmit } = methods;

  const values = watch();

  const onSubmit = async (data) => {
    data.price = Number(data.bid)
    try {
      if (!false) {
        onAddCart({
          ...data,
          subtotal: data.price * data.quantity,
          code: code
        });
      }
      reset();
      onGotoStep(0);
      navigate(PATH_DASHBOARD.eCommerce.checkout);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddCart = async () => {
    values.price = Number(values.bid)
    try {
      onAddCart({
        ...values,
        subtotal: values.price * values.quantity,
      });
    } catch (error) {
      console.error(error);
    }
  };

 
  return (
    <RootStyle {...other}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Typography variant="h5" paragraph>
          {name}
        </Typography>

        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Rating value={totalRating} precision={0.1} readOnly />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            ({fShortenNumber(totalReview)}
            reviews)
          </Typography>
        </Stack>

        <Typography variant="h4" sx={{ mb: 3 }} style={{display:'flex'}}>
          <Box component="span" style={{marginRight:50}}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Minimum Bid Price</Typography>
            {fCurrency(Number(minBiddingPrice.$numberDecimal))}
          </Box>
          <Box component="span">
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Current Bid Price</Typography>
            {fCurrency(highestBiddingPrice)}
          </Box>
        </Typography>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Divider sx={{ borderStyle: 'dashed' }} />

        <RHFTextField 
        name="bid" 
        placeholder="0.00"
        onChange={(event) => setValue('bid', Number(event.target.value))}
        value={getValues('bid') === 0 ? '' : getValues('bid')}
        InputLabelProps={{ shrink: true }}
        label="Bid" />
        
        <Stack direction="row" spacing={2} sx={{ mt: 5 }}>
          <Button fullWidth size="large" type="submit" variant="contained">
            Bid Now
          </Button>
        </Stack>

      </FormProvider>
    </RootStyle>
  );
}

// ----------------------------------------------------------------------
