import PropTypes from 'prop-types';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { MenuItem, IconButton } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../../../routes/paths';
// components
import Iconify from '../../../../components/Iconify';
import MenuPopover from '../../../../components/MenuPopover';

// ----------------------------------------------------------------------

ProductMoreMenu.propTypes = {
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
  onOpenBid: PropTypes.func,
  onCloseBid: PropTypes.func,
  productCode: PropTypes.string,
  status: PropTypes.string,
};

export default function ProductMoreMenu({ onDelete, onEdit, productCode, onOpenBid, onCloseBid, status }) {
  const [open, setOpen] = useState(null);
  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  const ICON = {
    mr: 2,
    width: 20,
    height: 20,
  };

  return (
    <>
      <IconButton onClick={handleOpen}>
        <Iconify icon={'eva:more-vertical-fill'} width={20} height={20} />
      </IconButton>

      <MenuPopover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        arrow="right-top"
        sx={{
          mt: -1,
          width: 160,
          '& .MuiMenuItem-root': { px: 1, typography: 'body2', borderRadius: 0.75 },
        }}
      >
        <MenuItem onClick={onDelete} sx={{ color: 'error.main' }}>
          <Iconify icon={'eva:trash-2-outline'} sx={{ ...ICON }} />
          Delete
        </MenuItem>

        <MenuItem onClick={onEdit} component={RouterLink} to={`${PATH_DASHBOARD.eCommerce.root}/product/${productCode}/edit`}>
          <Iconify icon={'eva:edit-fill'} sx={{ ...ICON }} />
          Edit
        </MenuItem>
         
         {status === 'in bid' && <MenuItem onClick={onCloseBid} sx={{ color: 'error.main' }}>
          <Iconify icon={'tabler:square-forbid'} sx={{ ...ICON }} />
          Close Bid
        </MenuItem> }

        {status === 'available' && <MenuItem onClick={onOpenBid} sx={{ color: 'success.main' }}>
          <Iconify icon={'tabler:square-forbid'} sx={{ ...ICON }} />
          Start Bid
        </MenuItem> }


      </MenuPopover>
    </>
  );
}
