import React from 'react'
import { useNavigate } from 'react-router-dom';
import { Box, Button, Divider, Typography, Stack } from '@mui/material';
import { CheckOutIllustration} from '../../../../assets';
import Iconify from '../../../../components/Iconify';
import { useDispatch } from '../../../../redux/store';
import { resetCart } from '../../../../redux/slices/product';
import { PATH_DASHBOARD } from '../../../../routes/paths';

export default function StripeCancel() {
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
            Your purchase was not successful.
          </Typography>

          <CheckOutIllustration sx={{ height: 260, my: 10 }} />

          <Typography align="left" paragraph>
            Please try again!
          </Typography>

  
        </Box>

        <Divider sx={{ my: 3 }} />

        <Stack direction={{ xs: 'column-reverse', sm: 'row' }} justifyContent="space-between" spacing={2}>
          <Button color="inherit" onClick={handleResetStep} startIcon={<Iconify icon={'eva:arrow-ios-back-fill'} />}>
            Continue Shopping
          </Button>
        </Stack>
      </Box>
  )
}