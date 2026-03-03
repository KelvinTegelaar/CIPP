import PropTypes from "prop-types";
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
import { ArrowRightIcon, CubeIcon } from "@heroicons/react/24/outline";

export const CippInfoCard = (props) => {
  const { isFetching, actionLink, actionText, value, icon, label, cardSize, ...other } = props;

  return (
    <Card {...other}>
      <Stack alignItems="center" direction="row" spacing={2} sx={{ p: 2 }}>
        <Avatar
          sx={{
            backgroundColor: "primary.alpha12",
            color: "primary.main",
          }}
        >
          <SvgIcon fontSize="small">{icon ? icon : <CubeIcon />}</SvgIcon>
        </Avatar>
        <div>
          <Typography color="text.secondary" variant="overline">
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
                  <ArrowRightIcon />
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
