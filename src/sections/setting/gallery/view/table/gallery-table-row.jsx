
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import { useBoolean } from 'src/hooks/use-boolean';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import { Link as RouterLink } from 'react-router-dom'; // Import Link from react-router-dom

import { Avatar } from '@mui/material';
import { useFetchData } from '../../components/fetch';

export function GalleryTableRow({ row, selected, onEditRow, onSelectRow, onDeleteRow }) {
    const confirm = useBoolean();
    const { fetchData } = useFetchData();

    const popover = usePopover();

    return (
        <>
            <TableRow hover selected={selected} aria-checked={selected} tabIndex={-1}>
                <TableCell padding="checkbox">
                    <Checkbox id={row.id} checked={selected} onClick={onSelectRow} />
                </TableCell>
                <TableCell>
                    <Avatar
                        variant="rounded"
                        alt={row.GalleryImages}
                        src={row.GalleryImages ? row?.GalleryImages?.[0] : "No File"} // Get the first image link and trim whitespace
                        sx={{ width: 100, height: 100 }} />
                </TableCell>

                <TableCell>
                    {row.type || 'Not available'}
                </TableCell>

                <TableCell>
                    {row.name || 'Not available'}
                </TableCell>

                <TableCell>
                    <Stack direction="row" alignItems="center">
                        <Tooltip title="Quick Edit" arrow>
                            <Link component={RouterLink} to={`/settings/gallery/edit/${row.id}`} sx={{ textDecoration: 'none' }}>
                                <IconButton>
                                    <Iconify icon="solar:pen-bold" />
                                </IconButton>
                            </Link>
                        </Tooltip>
                        <Tooltip title="More Actions" arrow>
                            <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
                                <Iconify icon="eva:more-vertical-fill" />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </TableCell>
            </TableRow>

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
                        to={`/settings/gallery/view/${row.id}`} // Set the destination URL
                        sx={{ color: 'green' }} // Keep your existing styling
                    >
                        <Iconify icon="solar:eye-bold" />
                        View
                    </MenuItem>
                </MenuList>
            </CustomPopover>

            <ConfirmDialog
                open={confirm.value}
                onClose={confirm.onFalse}
                title="Delete Banner"
                content="Are you sure you want to delete?"
                action={
                    <Button variant="contained" color="error" onClick={() => {
                        onDeleteRow();
                        fetchData();
                        confirm.onFalse();
                    }}>
                        Delete
                    </Button>
                }
            />
        </>
    );
}
