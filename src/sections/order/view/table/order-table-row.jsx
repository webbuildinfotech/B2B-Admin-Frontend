import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import MenuList from '@mui/material/MenuList';
import Collapse from '@mui/material/Collapse';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import { useBoolean } from 'src/hooks/use-boolean';
import { fCurrency } from 'src/utils/format-number';
import { fDate, fTime } from 'src/utils/format-time';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import { RouterLink } from 'src/routes/components';
import { Chip, Tooltip, Typography } from '@mui/material';
import useUserRole from 'src/layouts/components/user-role';
import StatusChangeModal from '../../components/StatusChangeModal';
import { handleStatusUpdate } from 'src/store/action/orderActions';
import { useDispatch } from 'react-redux';

// ----------------------------------------------------------------------

export function OrderTableRow({ row, selected, onViewRow, onSelectRow, onDeleteRow, onDownload, onStatusUpdate }) {
  // const isDownloadable = !!row.invoicePdf; // Check if pdfPath is available
  const userRole = useUserRole();


  const isDownloadable =
    !!row.invoicePdf &&
    (userRole === 'Admin' || (userRole === 'Vendor' && row.status === 'completed'));

  const confirm = useBoolean();

  const collapse = useBoolean();

  const popover = usePopover();


  const [modalOpen, setModalOpen] = useState(false);
  const dispatch = useDispatch();
  const handleOpen = () => setModalOpen(true);
  const handleClose = () => setModalOpen(false);

  const handleConfirm = async (newStatus) => {
    await dispatch(handleStatusUpdate(row.id, newStatus, onStatusUpdate));
    setModalOpen(false);
  };

  const getColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const renderPrimary = (
    <TableRow hover selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox
          checked={selected}
          onClick={onSelectRow}
          inputProps={{ id: `row-checkbox-${row.id}`, 'aria-label': `Row checkbox` }}
        />
      </TableCell>
      <TableCell align="center"> {row?.orderNo || 'N/A'} </TableCell>
      {userRole === 'Admin' && (
        <TableCell>
          <Stack spacing={2} direction="row" alignItems="center">
            <Stack sx={{ typography: 'body2', flex: '1 1 auto', alignItems: 'flex-start' }}>
              <Link color="inherit" sx={{ cursor: 'pointer' }}>
                {row?.user?.name}
              </Link>
              <Box component="span" sx={{ color: 'text.disabled' }}>
                {row?.user?.email}
              </Box>

              <Box component="span" sx={{ color: 'text.disabled' }}>
                {row?.user?.mobile}
              </Box>
            </Stack>
          </Stack>
        </TableCell>
      )}
      <TableCell align="center"> {row?.stdPkgs} </TableCell>
      <TableCell align="center"> {row?.noOfPkgs} </TableCell>
      <TableCell align="center"> {row?.totalQuantity} </TableCell>

      <TableCell align="center"> {`${row.discount}%`} </TableCell>
      <TableCell align="center"> {fCurrency(row.finalAmount)} </TableCell>

      <TableCell> {row.delivery} </TableCell>
      <TableCell>
        <ListItemText
          primary={fDate(row.createdAt)}
          secondary={fTime(row.createdAt)}
          primaryTypographyProps={{ typography: 'body2', noWrap: true }}
          secondaryTypographyProps={{
            mt: 0.5,
            component: 'span',
            typography: 'caption',
          }}
        />
      </TableCell>

      <TableCell>
        <Tooltip>
          <Chip
            label={row.status.charAt(0).toUpperCase() + row.status.slice(1)}
            color={getColor(row.status)}
            sx={{ cursor: userRole === 'Admin' ? 'pointer' : 'not-allowed' }}
            onClick={userRole === 'Admin' ? handleOpen : undefined}
          />
        </Tooltip>
      </TableCell>

      <TableCell align="center" sx={{ cursor: 'pointer' }}>
        <Tooltip
          title={
            // isDownloadable ? "Download File" : "File not available"}
          !row.invoicePdf
          ? 'File not available'
          : userRole === 'Vendor' && row.status !== 'completed'
            ? row.status === 'cancelled' 
              ? 'Order Cancelled'
              : 'Order Not Completed'
            : 'Download File'
      }
        >
          <span>
            {' '}
            {/* Wrap in span to allow tooltip on disabled button */}
            <IconButton
              onClick={() => isDownloadable && onDownload(row.id)}
              sx={{ color: 'primary.main' }}
              disabled={!isDownloadable} // Disable if no pdfPath
            >
              <Iconify icon="eva:download-outline" />
            </IconButton>
          </span>
        </Tooltip>
      </TableCell>

      <TableCell align="center" sx={{ px: 1, whiteSpace: 'nowrap' }}>
        <Tooltip title="Product Information">
          <IconButton
            color={collapse.value ? 'inherit' : 'default'}
            onClick={collapse.onToggle}
            sx={{ ...(collapse.value && { bgcolor: 'action.hover' }) }}
          >
            <Iconify icon="eva:arrow-ios-downward-fill" />
          </IconButton>
        </Tooltip>

        <Tooltip title="More Actions">
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );

  const renderSecondary = (
    <TableRow>
      <TableCell sx={{ p: 0, border: 'none' }} colSpan={12}>
        <Collapse
          in={collapse.value}
          timeout="auto"
          unmountOnExit
          sx={{ bgcolor: 'background.neutral' }}
        >
          <Paper sx={{ m: 1.5 }}>
            {row.orderItems.map((item) => (
              <Stack
                key={item.id}
                direction="row"
                alignItems="center"
                sx={{
                  p: (theme) => theme.spacing(1.5, 2, 1.5, 1.5),
                  '&:not(:last-of-type)': {
                    borderBottom: (theme) => `solid 2px ${theme.vars.palette.background.neutral}`,
                  },
                }}
              >
                <Avatar
                  src={item.product.productImages?.[0]}
                  variant="rounded"
                  sx={{ width: 48, height: 48, mr: 2, flexShrink: 0 }}
                />
                <ListItemText
                  primary={item.product.itemName}
                  secondary={item.product.alias}
                  primaryTypographyProps={{ 
                    typography: 'body2',
                    noWrap: true,
                    sx: { maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }
                  }}
                  secondaryTypographyProps={{
                    component: 'span',
                    color: 'text.disabled',
                    mt: 0.5,
                    sx: { 
                      display: 'block',
                      maxWidth: 200,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }
                  }}
                  sx={{ flex: '1 1 auto', minWidth: 0, mr: 2 }}
                />
                <Box sx={{ width: 100, textAlign: 'right', mr: 2, flexShrink: 0 }}>
                  <Typography variant="body2" color="text.primary" noWrap>
                    Price: {fCurrency(item.product.sellingPrice)}
                  </Typography>
                </Box>
                <Box sx={{ width: 50, textAlign: 'center', mr: 2, flexShrink: 0 }}>
                  <Typography variant="body2">
                    x {item.quantity}
                  </Typography>
                </Box>
                {item.discount > 0 ? (() => {
                  const itemTotal = (item.product?.sellingPrice || 0) * (item.quantity || 0);
                  const discountPercentage = itemTotal > 0 
                    ? Math.round((item.discount / itemTotal) * 100) 
                    : 0;
                  return (
                    <Box sx={{ width: 120, textAlign: 'right', mr: 2, flexShrink: 0 }}>
                      <Typography variant="body2" color="error.main" noWrap>
                        Discount @{discountPercentage}%
                      </Typography>
                    </Box>
                  );
                })() : (
                  <Box sx={{ width: 120, mr: 2, flexShrink: 0 }} />
                )}
                <Box sx={{ width: 130, textAlign: 'right', flexShrink: 0 }}>
                  <Typography variant="body2" color="text.primary" fontWeight="bold" noWrap>
                    {fCurrency((item.product.sellingPrice * item.quantity) - (item.discount || 0))}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Paper>
        </Collapse>
      </TableCell>
    </TableRow>
  );

  return (
    <>
      {renderPrimary}

      {renderSecondary}

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <MenuList>
          <MenuItem
            onClick={() => {
              confirm.onTrue();
              popover.onClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>

          <MenuItem
            component={RouterLink} // Set the component to Link
            to={`/orders/details/${row.id}`} // Set the destination URL
            sx={{ color: 'green' }} // Keep your existing styling
          >
            <Iconify icon="solar:eye-bold" />
            View
          </MenuItem>
        </MenuList>
      </CustomPopover>

      <StatusChangeModal
        open={modalOpen}
        currentStatus={row.status}
        handleClose={handleClose}
        handleConfirm={handleConfirm}
      />

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Delete
          </Button>
        }
      />
    </>
  );
}
