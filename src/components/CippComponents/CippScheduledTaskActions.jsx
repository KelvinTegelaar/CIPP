import { EyeIcon, TrashIcon } from "@heroicons/react/24/outline";
import { CopyAll, Edit, PlayArrow } from "@mui/icons-material";
import { usePermissions } from "../../hooks/use-permissions";

export const CippScheduledTaskActions = () => {
  const { checkPermissions } = usePermissions();
  const canWriteScheduler = checkPermissions(["CIPP.Scheduler.ReadWrite"]);
  const canReadScheduler = checkPermissions(["CIPP.Scheduler.Read", "CIPP.Scheduler.ReadWrite"]);

  return [
    {
      label: "View Task Details",
      link: "/cipp/scheduler/task?id=[RowKey]",
      icon: <EyeIcon />,
      condition: () => canReadScheduler,
    },
    {
      label: "Run Now",
      type: "POST",
      url: "/api/AddScheduledItem",
      data: { RowKey: "RowKey", RunNow: true },
      icon: <PlayArrow />,
      confirmText: "Are you sure you want to run [Name]?",
      allowResubmit: true,
      condition: () => canWriteScheduler,
    },
    {
      label: "Edit Job",
      link: "/cipp/scheduler/job?id=[RowKey]",
      multiPost: false,
      icon: <Edit />,
      color: "success",
      showInActionsMenu: true,
      condition: () => canWriteScheduler,
    },
    {
      label: "Clone and Edit Job",
      link: "/cipp/scheduler/job?id=[RowKey]&Clone=True",
      multiPost: false,
      icon: <CopyAll />,
      color: "success",
      showInActionsMenu: true,
      condition: () => canWriteScheduler,
    },
    {
      label: "Delete Job",
      icon: <TrashIcon />,
      type: "POST",
      url: "/api/RemoveScheduledItem",
      data: { id: "RowKey" },
      confirmText: "Are you sure you want to delete this job?",
      multiPost: false,
      condition: () => canWriteScheduler,
    },
  ];
};

export default CippScheduledTaskActions;
