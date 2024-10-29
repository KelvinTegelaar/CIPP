import { Skeleton, Stack } from "@mui/material";
import { PropertyList } from "../../components/property-list";
import { PropertyListItem } from "../../components/property-list-item";

export const CippPropertyList = (props) => {
  const {
    align = "vertical",
    propertyItems = [],
    isFetching,
    copyItems = false,
    layout = "single",
    showDivider = true,
  } = props;

  const half = Math.ceil(propertyItems.length / 2);
  const firstHalf = propertyItems.slice(0, half);
  const secondHalf = propertyItems.slice(half, propertyItems.length);

  return (
    <>
      {layout === "single" ? (
        <PropertyList>
          {isFetching ? (
            <>
              {propertyItems.map((item, index) => (
                <PropertyListItem
                  key={`${index}-index-PropertyListOffCanvas`}
                  align={align}
                  label={item.label}
                  value={<Skeleton width={280} />}
                  {...item}
                />
              ))}
            </>
          ) : (
            propertyItems.map((item, index) => (
              <PropertyListItem
                align={align}
                divider={showDivider}
                copyItems={copyItems}
                key={`${index}-index-PropertyListOffCanvas`}
                {...item}
              />
            ))
          )}
        </PropertyList>
      ) : (
        // Two-column layout
        <Stack
          direction={{
            md: "column",
            lg: "row",
          }}
          sx={{
            "& > *": {
              width: {
                md: "100%",
                lg: "50%",
              },
            },
          }}
        >
          <PropertyList>
            {isFetching ? (
              <>
                {firstHalf.map((item, index) => (
                  <PropertyListItem
                    key={`${index}-index-PropertyListOffCanvas`}
                    align={align}
                    label={item.label}
                    value={<Skeleton width={280} />}
                  />
                ))}
              </>
            ) : (
              firstHalf.map((item, index) => (
                <PropertyListItem
                  align={align}
                  divider={showDivider}
                  copyItems={copyItems}
                  key={`${index}-index-PropertyListOffCanvas`}
                  {...item}
                />
              ))
            )}
          </PropertyList>
          <PropertyList>
            {isFetching ? (
              <>
                {secondHalf.map((item, index) => (
                  <PropertyListItem
                    key={`${index}-index-PropertyListOffCanvas`}
                    align={align}
                    label={item.label}
                    value={<Skeleton width={280} />}
                  />
                ))}
              </>
            ) : (
              secondHalf.map((item, index) => (
                <PropertyListItem
                  align={align}
                  divider={showDivider}
                  copyItems={copyItems}
                  key={`${index}-index-PropertyListOffCanvas`}
                  {...item}
                />
              ))
            )}
          </PropertyList>
        </Stack>
      )}
    </>
  );
};
