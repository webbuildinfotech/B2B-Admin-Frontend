import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import {
    Box,
    Card, Stack, Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Field, Form } from 'src/components/hook-form';
import { useDispatch } from 'react-redux';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { createPrivacy, privacyList } from 'src/store/action/settingActions';

const PrivacySchema = zod.object({
    content: zod.string().min(1, 'Privacy Policy is required!'),
});

export default function PrivacyEditForm() {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);

    const methods = useForm({
        resolver: zodResolver(PrivacySchema),
        defaultValues: { content: '' },
    });

    const { reset, handleSubmit } = methods;

    useEffect(() => {
        const loadPrivacyData = async () => {
            try {
                const privacyData = await dispatch(privacyList());
                if (privacyData?.content) {
                    reset({ content: privacyData.content });
                }
            } catch (error) {
                console.error('Failed to load privacy policy', error);
            }
        };
        loadPrivacyData();
    }, [dispatch, reset]);

    const onSubmit = handleSubmit(async (data) => {
        setLoading(true);
        try {
            await dispatch(createPrivacy(data));
        } catch (error) {
            console.error('Submission failed', error);
        } finally {
            setLoading(false);
        }
    });

    return (
        <Box mt={2}>
            <CustomBreadcrumbs
                links={[
                    { name: '' },
                ]}
            />
            <Form methods={methods} onSubmit={onSubmit}>
                <Stack spacing={3}>
                    <Card>
                        <Stack spacing={2} sx={{ p: 3 }}>
                            <Typography variant="subtitle2">Privacy Policy</Typography>
                            <Field.Editor name="content" sx={{ maxHeight: 480 }} />
                        </Stack>
                    </Card>

                    <Stack direction="row" justifyContent="flex-end" spacing={2}>
                        <LoadingButton type="submit" variant="contained" loading={loading}>
                            Submit
                        </LoadingButton>
                    </Stack>
                </Stack>
            </Form>
        </Box>
    );
}
