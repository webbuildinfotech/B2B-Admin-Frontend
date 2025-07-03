import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useEffect, useCallback, useState } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { toast } from 'src/components/snackbar';
import { Form, Field, schemaHelper } from 'src/components/hook-form';
import { useRouter } from 'src/routes/hooks';
import { Box, FormControl, InputLabel, MenuItem, Select, Stack } from '@mui/material';

import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import {
  deleteBannerAllImage,
  deleteBannerImage,
  editBanner,
} from 'src/store/action/settingActions';

// Define schema for multiple file uploads
export const BannerFormSchema = zod.object({
  name: zod.string().min(1, { message: 'Name is required!' }),
  type: zod.string().min(1, { message: 'Type is required!' }),
  bannerImages: zod.any().optional(), // Allow any type for multiple files
});

// Define the BannerType enum
const BannerType = {
  Home: 'Home',
  Contact: 'Contact',
  About: 'About',
  Dealer: 'Dealer',
  Resource: 'Resource',
  FAQs: 'FAQs',
};

export function BannerEditForm({ currentBanner }) {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const router = useRouter();

  const defaultValues = useMemo(
    () => ({
      name: currentBanner?.name || '',
      type: currentBanner?.type || BannerType.Home,
      bannerImages: currentBanner?.BannerImages || [],
    }),
    [currentBanner]
  );

  const methods = useForm({
    resolver: zodResolver(BannerFormSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = methods;
  const values = watch();

  useEffect(() => {
    if (currentBanner) {
      reset(defaultValues);
    }
  }, [currentBanner, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('type', data.type);

    // Handle multiple banner images
    const bannerImages = values.bannerImages || [];
    bannerImages.forEach((image) => {
      formData.append('bannerImages', image);
    });

    setLoading(true);
    try {
      const response = await dispatch(editBanner(currentBanner.id, formData));
      if (response) {
        navigate('/settings/banner');
      }
    } catch (error) {
      console.error('Submission failed', error);
    } finally {
      setLoading(false);
    }
  });

  const handleRemoveFile = useCallback(
    async (file, fieldName) => {
      try {
        const isLocalFile = file instanceof File;

        if (isLocalFile) {
          // Local file को remove करें
          setValue(
            fieldName,
            values[fieldName].filter((item) => item !== file)
          );
        } else {
          // Server से existing image को delete करें
          const result = await dispatch(
            deleteBannerImage(currentBanner.id, [file])
          );
          if (result) {
            setValue(
              fieldName,
              values[fieldName].filter((item) => item !== file)
            );
          }
        }
      } catch (error) {
        console.error('Error deleting image:', error);
        toast.error('Failed to delete image');
      }
    },
    [dispatch, currentBanner?.id, setValue, values]
  );

  const handleRemoveAllFiles = useCallback(
    async (fieldName) => {
      try {
        const result = await dispatch(deleteBannerAllImage(currentBanner.id));
        if (result) {
          setValue(fieldName, []);
        }
      } catch (error) {
        console.error('Error deleting all images:', error);
      }
    },
    [dispatch, currentBanner?.id, setValue, values]
  );

  const handleChangeType = useCallback(
    ({ target: { value } }) => {
      setValue('type', value);
    },
    [setValue]
  );

  const renderBannerDetails = (
    <Card>
      <CardHeader title="Banner Details" />
      <Divider sx={{ mt: 1 }} />

      <Stack spacing={3} sx={{ p: 3 }}>
        <Field.Text name="name" label="Banner Name" />

        <FormControl fullWidth>
          <InputLabel id="type-select-label">Type</InputLabel>
          <Select
            labelId="type-select-label"
            id="type-select"
            value={watch('type')}
            onChange={handleChangeType}
            label="Type"
            disabled
          >
            {Object.values(BannerType).map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Stack spacing={1.5}>
          <Typography variant="subtitle2">Banner Images</Typography>

          <Field.Upload
            multiple
            thumbnail
            name="bannerImages"
            maxSize={3145728}
            onRemove={(file) => handleRemoveFile(file, 'bannerImages')}
            onRemoveAll={() => handleRemoveAllFiles('bannerImages')}
          />
        </Stack>

        <Box display="flex" justifyContent="flex-end">
          <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting}>
            {currentBanner ? 'Save changes' : 'Create banner'}
          </LoadingButton>
        </Box>
      </Stack>
    </Card>
  );

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Stack>{renderBannerDetails}</Stack>
    </Form>
  );
}
