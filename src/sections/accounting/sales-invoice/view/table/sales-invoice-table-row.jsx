import React from 'react';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import { useBoolean } from 'src/hooks/use-boolean';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import { RouterLink } from 'src/routes/components';
import { fCurrency, fAmountWithoutMinus } from 'src/utils/format-number';
import { fDate } from 'src/utils/format-time';

export function SalesInvoiceTableRow({ row, selected, onSelectRow, onDeleteRow, onDownload }) {
  const confirm = useBoolean();
  const popover = usePopover();
  const hasPdf = !!row?.invoicePdf;

  const renderPrimary = (
    <TableRow hover selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox
          checked={selected}
          onClick={onSelectRow}
          inputProps={{ id: `row-checkbox-${row.id}`, 'aria-label': `Row checkbox` }}
        />
      </TableCell>
      <TableCell>
        <Stack spacing={2} direction="row" alignItems="center">
          <Stack sx={{ typography: 'body2', flex: '1 1 auto', alignItems: 'flex-start' }}>
            <Link color="inherit" sx={{ cursor: 'pointer' }}>
              {row?.voucherNo || '-'}
            </Link>
          </Stack>
        </Stack>
      </TableCell>
      <TableCell align="center">
        {hasPdf && onDownload ? (
          <Tooltip title="Download PDF">
            <IconButton
              color="primary"
              size="small"
              onClick={() => onDownload(row)}
            >
              <Iconify icon="solar:download-minimalistic-bold" />
            </IconButton>
          </Tooltip>
        ) : (
          <Typography variant="caption" color="text.disabled">-</Typography>
        )}
      </TableCell>
      <TableCell>{row?.partyName || '-'}</TableCell>
      <TableCell>{fDate(row?.voucherDate) || '-'}</TableCell>
      <TableCell>{row?.voucherType || '-'}</TableCell>
      <TableCell align="right">{fCurrency(row?.amount) || '-'}</TableCell>
      <TableCell align="right">{fCurrency(row?.closingBalance) || '-'}</TableCell>
      <TableCell align="center" sx={{ px: 1, whiteSpace: 'nowrap' }}>
        <Stack direction="row" alignItems="center" justifyContent="center">
          <Tooltip title="More Actions">
            <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </Tooltip>
        </Stack>
      </TableCell>
    </TableRow>
  );

  return (
    <>
      {renderPrimary}

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <MenuList>
          {hasPdf && onDownload && (
            <MenuItem
              onClick={() => {
                onDownload(row);
                popover.onClose();
              }}
            >
              <Iconify icon="solar:download-minimalistic-bold" />
              Download PDF
            </MenuItem>
          )}
          <MenuItem
            component={RouterLink}
            to={`/sales-invoice/view/${row.id}`}
            sx={{ color: 'green' }}
          >
            <Iconify icon="solar:eye-bold" />
            View
          </MenuItem>
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
        </MenuList>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete Sales Invoice"
        content="Are you sure you want to delete this sales invoice?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              onDeleteRow();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}

