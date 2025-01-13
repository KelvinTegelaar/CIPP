import { OpenInNew } from "@mui/icons-material";
import CippButtonCard from "/src/components/CippCards/CippButtonCard";
import { Button, Stack, SvgIcon, Typography } from "@mui/material";
import { CippOffCanvas } from "../CippComponents/CippOffCanvas";
import { useState } from "react";
import { getCippTranslation } from "/src/utils/get-cipp-translation";

export const CippBackendCard = ({ backendComponents, item }) => {
  const [open, setOpen] = useState(false);

  const BackendButton = () => {
    return (
      <Stack direction="row" spacing={1}>
        <Button
          variant="contained"
          size="small"
          disabled={backendComponents.isFetching}
          target="_blank"
          rel="noreferrer"
          href={backendComponents?.data?.Results?.[item.id] ?? "#"}
          {...item?.linkProps}
        >
          <SvgIcon fontSize="small" style={{ marginRight: 4 }}>
            <OpenInNew />
          </SvgIcon>
          Launch
        </Button>
        {item.offcanvas && (
          <Button
            variant="contained"
            size="small"
            onClick={() => setOpen(true)}
            disabled={backendComponents.isFetching}
            startIcon={
              item.offcanvasIcon ? <SvgIcon fontSize="small">{item.offcanvasIcon}</SvgIcon> : ""
            }
          >
            {item.offcanvasTitle}
          </Button>
        )}
      </Stack>
    );
  };

  return (
    <>
      <CippButtonCard
        title={item.name}
        cardSx={{ display: "flex", flexDirection: "column", height: "100%" }}
        CardButton={<BackendButton />}
      >
        <Typography variant="body2">{item.description}</Typography>
      </CippButtonCard>
      {item.offcanvas && (
        <CippOffCanvas visible={open} onClose={() => setOpen(false)} size="md">
          {Object.keys(item?.offcanvasData).length > 0 && (
            <>
              <Typography variant="h4" sx={{ mx: 1, mb: 3 }}>
                {item.offcanvasTitle}
              </Typography>
              {Object.keys(item.offcanvasData).length > 0 && (
                <>
                  {Object.keys(item.offcanvasData).map((key) => (
                    <>
                      <Typography variant="h6" sx={{ mx: 1 }}>
                        {getCippTranslation(key)}
                      </Typography>
                      {item.offcanvasData[key]}
                    </>
                  ))}
                </>
              )}
            </>
          )}
        </CippOffCanvas>
      )}
    </>
  );
};
