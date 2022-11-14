import { useEffect } from 'react';
// @mui
import { Container, Stack , Grid} from '@mui/material';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getProducts, resetCart } from '../../redux/slices/product';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';

// sections
import {
  // ShopTagFiltered,
  // ShopProductSort,
  ShopProductList,
  // ShopFilterSidebar,
  ShopProductSearch,
} from '../../sections/@dashboard/e-commerce/shop';
import {
   AppFeatured,
} from '../../sections/@dashboard/general/app';


// ----------------------------------------------------------------------

export default function EcommerceShop() {
  const { themeStretch } = useSettings();

  const dispatch = useDispatch();


  const { products } = useSelector((state) => state.product);


  useEffect(() => {
    dispatch(resetCart());
    dispatch(getProducts());
  }, [dispatch]);

  


  return (
    <Page title="Ecommerce: Shop">
      <Container maxWidth={themeStretch ? false : 'xm'} style={{width:1300, marginRight:12,marginBottom:22}}>
        <Grid container spacing={3}>
          <Grid item xs={9} md={11} >
            <AppFeatured />
          </Grid>
        </Grid>
      </Container>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="Shop"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            {
              name: 'E-Commerce',
              href: PATH_DASHBOARD.eCommerce.root,
            },
            { name: 'Shop' },
          ]}
        />

        <Stack
          spacing={2}
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ sm: 'center' }}
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
          <ShopProductSearch />

        </Stack>

      
        <ShopProductList products={products} loading={!products.length} />
      </Container>
    </Page>
  );
}
