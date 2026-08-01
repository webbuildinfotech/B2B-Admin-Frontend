import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { PageSeo } from 'src/components/seo';

export default function Page() {
  return (
    <>
      <PageSeo
        title="Blank"
        description="Intecomart Admin blank page."
      />
      <Container>
        <Typography variant="h4">Blank</Typography>
      </Container>
    </>
  );
}
