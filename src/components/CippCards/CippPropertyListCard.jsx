import PropTypes from "prop-types";
import EyeIcon from "@heroicons/react/24/outline/EyeIcon";
import TrashIcon from "@heroicons/react/24/outline/TrashIcon";
import { Button, Card, CardHeader, Divider, Skeleton, SvgIcon } from "@mui/material";
import { ActionList } from "../../components/action-list";
import { ActionListItem } from "../../components/action-list-item";
import { PropertyList } from "../../components/property-list";
import { PropertyListItem } from "../../components/property-list-item";
import { useRouter } from "next/router";

export const CippPropertyListCard = (props) => {
  const { actionItems = [], propertyItems = [], isFetching, title, actionButton, ...other } = props;
  const router = useRouter();

  return (
    <>
      <Card sx={{ width: "100%" }} {...other}>
        <CardHeader action={actionButton} title={title} />
        <Divider />
        <PropertyList>
          {isFetching ? (
            <Skeleton variant="rectangular" height={200} />
          ) : (
            propertyItems.map((item, index) => <PropertyListItem divider key={index} {...item} />)
          )}
        </PropertyList>
        <Divider />
        <ActionList>
          {actionItems.map((item, index) => (
            <ActionListItem
              key={index}
              icon={<SvgIcon fontSize="small">{item.icon}</SvgIcon>}
              label={item.label}
              onClick={
                //if item.link is set, go to that path using the nextjs.
                item.link ? () => router.push(item.link) : item.onClick
              }
            />
          ))}
        </ActionList>
      </Card>
    </>
  );
};

CippPropertyListCard.propTypes = {
  customer: PropTypes.object.isRequired,
  onEdit: PropTypes.func,
};
