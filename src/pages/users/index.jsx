import { PageSeo } from 'src/components/seo';
import { UserListView } from 'src/sections/user/view';

export default function Page() {
  return (
    <>
      <PageSeo
        title="Users"
        description="Manage Intecomart admin and user accounts, roles, and access permissions."
      />
      <UserListView />
    </>
  );
}
