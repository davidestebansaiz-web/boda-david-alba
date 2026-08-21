import {
  Datagrid,
  DateField,
  Edit,
  EditButton,
  FunctionField,
  Labeled,
  List,
  NumberField,
  NumberInput,
  SearchInput,
  SimpleForm,
  TextField,
  TextInput,
  useDataProvider,
  useNotify,
  useRecordContext,
  useRefresh,
} from "react-admin";
import { Box, Button, Chip } from "@mui/material";
import { useState } from "react";

interface InvitationRecord {
  id: string;
  token: string;
  qrTargetUrl: string;
  qrSvg: string;
  qrUpdatedAt: string;
  rsvp: {
    status: "PENDING" | "ACCEPTED" | "DECLINED";
    attendingCount: number | null;
  } | null;
}

const rsvpStatusLabels = {
  ACCEPTED: { color: "success", label: "Aceptada" },
  DECLINED: { color: "error", label: "Rechazada" },
  PENDING: { color: "warning", label: "Pendiente" },
} as const;

const RsvpStatus = () => {
  const record = useRecordContext<InvitationRecord>();
  const status = record?.rsvp?.status;

  if (!status) {
    return <Chip label="Sin respuesta" color="default" size="small" variant="outlined" />;
  }

  const presentation = rsvpStatusLabels[status];
  return <Chip label={presentation.label} color={presentation.color} size="small" />;
};

const invitationFilters = [<SearchInput key="search" source="q" alwaysOn />];

const QrPreview = () => {
  const record = useRecordContext<InvitationRecord>();

  if (!record?.qrSvg) {
    return <Box sx={{ color: "text.secondary" }}>QR no disponible</Box>;
  }

  const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(record.qrSvg)}`;

  return (
    <Box
      component="img"
      src={dataUri}
      alt={`QR for ${record.token}`}
      sx={{
        width: 180,
        height: 180,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        p: 1,
        bgcolor: "background.paper",
      }}
    />
  );
};

const RegenerateQrButton = () => {
  const record = useRecordContext<InvitationRecord>();
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const refresh = useRefresh();
  const [loading, setLoading] = useState(false);

  const regenerate = async (): Promise<void> => {
    if (!record?.id) {
      return;
    }

    setLoading(true);

    try {
      await dataProvider.update("invitations", {
        id: record.id,
        data: {
          regenerateQr: true,
        },
        previousData: record,
      });

      notify("QR regenerado", { type: "info" });
      refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo regenerar el QR";
      notify(message, { type: "warning" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outlined" onClick={regenerate} disabled={loading || !record?.id}>
      {loading ? "Regenerando..." : "Regenerar QR"}
    </Button>
  );
};

export const InvitationList = () => (
  <List
    perPage={25}
    sort={{ field: "updatedAt", order: "DESC" }}
    filters={invitationFilters}
    title="Invitations"
  >
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="token" />
      <TextField source="guestName" />
      <NumberField source="maxGuests" />
      <FunctionField
        label="Estado RSVP"
        render={() => <RsvpStatus />}
      />
      <FunctionField
        label="Asistentes"
        render={(record: InvitationRecord) => record.rsvp?.attendingCount ?? "-"}
      />
      <TextField source="adminNotes" emptyText="-" />
      <TextField source="qrTargetUrl" />
      <DateField source="qrUpdatedAt" showTime />
      <DateField source="updatedAt" showTime />
      <EditButton />
    </Datagrid>
  </List>
);

export const InvitationEdit = () => (
  <Edit title="Edit invitation">
    <SimpleForm>
      <TextInput source="id" disabled fullWidth />
      <TextInput source="token" disabled fullWidth />
      <TextInput source="guestName" required fullWidth />
      <NumberInput source="maxGuests" required min={1} />
      <Labeled label="Estado RSVP">
        <RsvpStatus />
      </Labeled>
      <FunctionField
        label="Asistentes confirmados"
        render={(record: InvitationRecord) => record.rsvp?.attendingCount ?? "-"}
      />
      <TextInput source="adminNotes" multiline minRows={3} fullWidth />
      <TextInput source="qrTargetUrl" fullWidth />
      <RegenerateQrButton />
      <Labeled label="QR Preview">
        <QrPreview />
      </Labeled>
      <TextInput source="qrUpdatedAt" disabled fullWidth />
      <TextInput source="createdAt" disabled fullWidth />
      <TextInput source="updatedAt" disabled fullWidth />
    </SimpleForm>
  </Edit>
);
