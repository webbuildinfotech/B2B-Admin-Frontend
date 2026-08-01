import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Backdrop, CircularProgress } from '@mui/material';

import { PageSeo } from 'src/components/seo';
import { logout } from 'src/store/action/authActions';
import ConfirmDialog from 'src/components/logout/confirm-dialog';

export default function LogoutConfirmation() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [openConfirmDialog, setOpenConfirmDialog] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    const log = await dispatch(logout());
    if (log) {
      navigate('/auth/sign-in');
    }
  };

  const handleCancel = () => {
    setOpenConfirmDialog(false);
    navigate(-1);
  };

  return (
    <>
      <PageSeo
        title="Logout"
        description="Sign out of Intecomart Admin Panel securely."
      />

      <Backdrop open={openConfirmDialog} sx={{ color: '#fff', zIndex: 1200 }}>
        {loading ? <CircularProgress color="inherit" /> : null}
      </Backdrop>

      <ConfirmDialog
        open={openConfirmDialog}
        onClose={handleCancel}
        onConfirm={handleLogout}
        title="Are you sure you want to logout?"
        content="This will log you out of your account. Please confirm if you want to proceed."
      />
    </>
  );
}
