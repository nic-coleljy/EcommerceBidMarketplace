// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// components
import SvgIconStyle from '../../../components/SvgIconStyle';

// ----------------------------------------------------------------------

const getIcon = (name) => <SvgIconStyle src={`/icons/${name}.svg`} sx={{ width: 1, height: 1 }} />;

const ICONS = {
  user: getIcon('ic_user'),
  ecommerce: getIcon('ic_ecommerce')
};

const navConfig = [

  // MANAGEMENT
  // ----------------------------------------------------------------------
  {
    subheader: 'management',
    items: [
      // MANAGEMENT : E-COMMERCE
      {
        title: 'e-commerce',
        path: PATH_DASHBOARD.eCommerce.root,
        icon: ICONS.cart,
        children: [
          { title: 'shop', path: PATH_DASHBOARD.eCommerce.shop },
          // { title: 'create', path: PATH_DASHBOARD.eCommerce.newProduct },
          // { title: 'edit', path: PATH_DASHBOARD.eCommerce.editById },
          { title: 'My Products', path: PATH_DASHBOARD.eCommerce.list },
          // { title: 'checkout', path: PATH_DASHBOARD.eCommerce.checkout },
          // { title: 'invoice', path: PATH_DASHBOARD.eCommerce.invoice },
        ],
      }, 

    ],
  },

];

export default navConfig;
