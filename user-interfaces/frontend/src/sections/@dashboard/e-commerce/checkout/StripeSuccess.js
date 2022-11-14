import React from 'react'
import { useNavigate } from 'react-router-dom';
import { Box, Link, Button, Divider, Typography, Stack } from '@mui/material';
import { OrderCompleteIllustration } from '../../../../assets';
import Iconify from '../../../../components/Iconify';
import { useDispatch } from '../../../../redux/store';
import { resetCart } from '../../../../redux/slices/product';
import { PATH_DASHBOARD } from '../../../../routes/paths';

export default function StripeSuccess() {
    const navigate = useNavigate();
     const dispatch = useDispatch();

    const handleResetStep = () => {
    dispatch(resetCart());
    navigate(PATH_DASHBOARD.eCommerce.shop);
  };
  return (
      <Box sx={{ p: 4, maxWidth: 480, margin: 'auto' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" paragraph>
            Thank you for your purchase!
          </Typography>

          <OrderCompleteIllustration sx={{ height: 260, my: 10 }} />

          <Typography align="left" paragraph>
            Thanks for placing order &nbsp;
            <Link href="#">01dc1370-3df6-11eb-b378-0242ac130002</Link>
          </Typography>

          <Typography align="left" sx={{ color: 'text.secondary' }}>
            We will send you a notification within 5 days when it ships.
            <br /> <br /> If you have any question or queries then fell to get in contact us. <br /> <br /> All the
            best,
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Stack direction={{ xs: 'column-reverse', sm: 'row' }} justifyContent="space-between" spacing={2}>
          <Button color="inherit" onClick={handleResetStep} startIcon={<Iconify icon={'eva:arrow-ios-back-fill'} />}>
            Continue Shopping
          </Button>
          <Button
            variant="contained"
            startIcon={<Iconify icon={'ant-design:file-pdf-filled'} />}
          >
            Download as PDF
          </Button>
        </Stack>
      </Box>
  )
}
