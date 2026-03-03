import ArchiveBoxIcon from "@heroicons/react/24/outline/ArchiveBoxIcon";
import CheckCircleIcon from "@heroicons/react/24/outline/CheckCircleIcon";
import DocumentDuplicateIcon from "@heroicons/react/24/outline/DocumentDuplicateIcon";
import ReceiptRefundIcon from "@heroicons/react/24/outline/ReceiptRefundIcon";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Select,
  Stack,
  SvgIcon,
} from "@mui/material";

import { ActionList } from "../../../components/action-list";
import { ActionListItem } from "../../../components/action-list-item";

export const CippSettingSideMenu = (props) => {
  return (
    <>
      <Card>
        <CardHeader title="Quick Actions" />
        <Divider />
        <CardContent>
          <Stack spacing={2}>
            <Select
              fullWidth
              inputProps={{
                sx: {
                  alignItems: "center",
                  display: "flex",
                },
              }}
            ></Select>
            <div>
              <Button variant="contained">Save Changes</Button>
            </div>
            <Divider />
            current settings as itemList
          </Stack>
        </CardContent>
        <Divider />
        <ActionList>
          <ActionListItem
            icon={
              <SvgIcon fontSize="small">
                <CheckCircleIcon />
              </SvgIcon>
            }
            label="Mark as Paid"
          />
          <ActionListItem
            icon={
              <SvgIcon fontSize="small">
                <DocumentDuplicateIcon />
              </SvgIcon>
            }
            label="Duplicate Order"
          />
          <ActionListItem
            disabled
            icon={
              <SvgIcon fontSize="small">
                <ReceiptRefundIcon />
              </SvgIcon>
            }
            label="Request a Refund"
          />
          <ActionListItem
            icon={
              <SvgIcon fontSize="small">
                <ArchiveBoxIcon />
              </SvgIcon>
            }
            label="Archive Order"
          />
        </ActionList>
      </Card>
    </>
  );
};
