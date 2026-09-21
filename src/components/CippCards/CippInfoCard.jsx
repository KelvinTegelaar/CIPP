import PropTypes from "prop-types";
import { CippIcons } from "../../utils/icon-registry";
import {
  Avatar,
  Button,
  Card,
  CardActions,
  Divider,
  Link,
  Skeleton,
  Stack,
  SvgIcon,
  Typography,
} from "@mui/material";

export const CippInfoCard = (props) => {
  const { isFetching, actionLink, actionText, value, icon, label, cardSize, ...other } = props;

  return (
    <Card {...other}>
      <Stack
        direction="row"
        spacing={2}
        sx={{
          alignItems: "center",
          p: 2
        }}>
        <Avatar
          sx={{
            backgroundColor: "primary.alpha12",
            color: "primary.main",
          }}
        >
          <SvgIcon fontSize="small">{icon ? icon : <CippIcons.CubeIcon />}</SvgIcon>
        </Avatar>
        <div>
          <Typography variant="overline" sx={{
            color: "text.secondary"
          }}>
            {isFetching ? <Skeleton width={150} /> : label}
          </Typography>
          <Typography variant="h6">{isFetching ? <Skeleton width={200} /> : value}</Typography>
        </div>
      </Stack>
      {actionLink && (
        <>
          <Divider />
          <CardActions
            sx={{
              px: 3,
              py: 1,
            }}
          >
            <Button
              color="inherit"
              component={Link}
              endIcon={
                <SvgIcon fontSize="small">
                  <CippIcons.ArrowRightIcon />
                </SvgIcon>
              }
              href={actionLink}
              size="small"
            >
              {actionText}
            </Button>
          </CardActions>
        </>
      )}
    </Card>
  );
};

CippInfoCard.propTypes = {
  action: PropTypes.node,
  icon: PropTypes.node,
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
};
