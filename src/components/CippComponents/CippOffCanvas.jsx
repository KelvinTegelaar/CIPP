import { Drawer } from "@mui/material";
import { CippPropertyListCard } from "../CippCards/CippPropertyListCard";
import { getCippTranslation } from "../../utils/get-cipp-translation";
import { useDialog } from "../../hooks/use-dialog";

export const CippOffCanvas = (props) => {
  const { visible, extendedInfoFields = [], extendedData, actions, onClose, isFetching } = props;
  const extendedInfo = extendedInfoFields.map((field) => {
    return {
      label: getCippTranslation(field),
      value: extendedData?.[field],
    };
  });

  return (
    <>
      <Drawer
        PaperProps={{
          sx: { width: 400 },
        }}
        ModalProps={{
          keepMounted: false,
        }}
        anchor={"right"}
        open={visible}
        onClose={onClose}
      >
        {extendedInfo && (
          <CippPropertyListCard
            isFetching={isFetching}
            align="vertical"
            title="Extended Info"
            propertyItems={extendedInfo}
            copyItems={true}
            actionItems={actions}
          />
        )}
      </Drawer>
    </>
  );
};
