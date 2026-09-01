import { Card, CardHeader, Divider, Stack } from "@mui/material";
import { PropertyList } from "../../../components/property-list";
import { PropertyListItem } from "../../../components/property-list-item";

export const OrderPayment = (props) => {
  const { title, items = [] } = props;
  const half = Math.ceil(items.length / 2);
  const firstHalf = items.slice(0, half);
  const secondHalf = items.slice(half, items.length);

  return (
    <Card>
      <CardHeader title={title} />
      <Divider />
      <Stack
        direction={{
          xs: "column",
          md: "row",
        }}
        sx={{
          "& > *": {
            width: {
              md: "50%",
            },
          },
        }}
      >
        <PropertyList>
          {firstHalf.map((item) => (
            <PropertyListItem key={item.label} label={item.label} value={item.value} />
          ))}
        </PropertyList>
        <PropertyList>
          {secondHalf.map((item) => (
            <PropertyListItem key={item.label} label={item.label} value={item.value} />
          ))}
        </PropertyList>
      </Stack>
    </Card>
  );
};
