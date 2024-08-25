import { Card, CardHeader, Divider, Skeleton, SvgIcon } from "@mui/material";
import { ActionList } from "../../components/action-list";
import { ActionListItem } from "../../components/action-list-item";
import { PropertyList } from "../../components/property-list";
import { PropertyListItem } from "../../components/property-list-item";
import { useDialog } from "../../hooks/use-dialog";
import { CippApiDialog } from "../CippComponents/CippApiDialog";

export const CippPropertyListCard = (props) => {
  const {
    align = "vertical",
    actionItems = [],
    propertyItems = [],
    isFetching,
    title,
    actionButton,
    copyItems = false,
    data,
    ...other
  } = props;
  const createDialog = useDialog();

  return (
    <>
      <Card sx={{ width: "100%" }} {...other}>
        <CardHeader action={actionButton} title={title} />
        <Divider />
        <PropertyList>
          {isFetching ? (
            <>
              <PropertyListItem align={align} label="Loading" value={<Skeleton width={280} />} />
            </>
          ) : (
            propertyItems.map((item, index) => (
              <PropertyListItem align={align} copyItems divider key={index} {...item} />
            ))
          )}
        </PropertyList>
        <Divider />
        <ActionList>
          {actionItems.map((item, index) => (
            <>
              <ActionListItem
                key={index}
                icon={<SvgIcon fontSize="small">{item.icon}</SvgIcon>}
                label={item.label}
                onClick={
                  //if item.link is set, browse there in a new tab
                  item.link ? () => window.open(item.link, "_blank") : createDialog.handleOpen
                }
              />
              <CippApiDialog
                createDialog={createDialog}
                title="Confirmation"
                fields={{ type: "textField", name: "input" }}
                api={item}
                row={data}
              />
            </>
          ))}
        </ActionList>
      </Card>
    </>
  );
};
