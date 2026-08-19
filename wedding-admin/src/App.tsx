import { Admin, Resource } from "react-admin";

import { authProvider } from "./providers/auth-provider";
import { dataProvider } from "./providers/data-provider";
import { InvitationEdit, InvitationList } from "./resources/invitations";

export const App = () => (
  <Admin title="Wedding Admin" authProvider={authProvider} dataProvider={dataProvider}>
    <Resource name="invitations" list={InvitationList} edit={InvitationEdit} />
  </Admin>
);
