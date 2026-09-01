import StarIcon from '@heroicons/react/24/solid/StarIcon';
import {
  Card,
  CardContent,
  LinearProgress,
  List,
  ListItem,
  Stack,
  SvgIcon,
  Typography
} from '@mui/material';

const reviews = [
  {
    totalReviews: 10,
    score: 5
  },
  {
    totalReviews: 14,
    score: 4
  },
  {
    totalReviews: 5,
    score: 3
  },
  {
    totalReviews: 2,
    score: 2
  },
  {
    totalReviews: 1,
    score: 1
  }
];

export const ProductInsightsReviews = () => {
  const totalScore = reviews.reduce((acc, value) => acc + (value.score * value.totalReviews), 0);
  const totalReviews = reviews.reduce((acc, value) => acc + value.totalReviews, 0);
  const averageScore = (totalScore / totalReviews).toFixed(2);

  return (
    <Card>
      <CardContent>
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: "center"
          }}
        >
          <SvgIcon
            fontSize="large"
            sx={{ color: 'rgba(255, 180, 0, 1)' }}
          >
            <StarIcon />
          </SvgIcon>
          <Typography variant="h3">
            {averageScore}
          </Typography>
        </Stack>
        <Typography
          variant="subtitle2"
          sx={{
            color: "text.secondary",
            mb: 2,
            mt: 1
          }}>
          14 reviews in total based on 122 reviews
        </Typography>
        <Card variant="outlined">
          <List disablePadding>
            {reviews.map((review, index) => {
              const hasDivider = reviews.length > index + 1;
              const percentage = ((100 * review.totalReviews) / totalReviews).toFixed(2);

              return (
                <ListItem
                  divider={hasDivider}
                  key={review.score}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      alignItems: "center",
                      flexGrow: 1,
                      p: 1
                    }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary"
                      }}
                    >
                      x{review.score}
                    </Typography>
                    <LinearProgress
                      color="primary"
                      sx={{
                        borderRadius: 2,
                        flexGrow: 1
                      }}
                      value={Number.parseFloat(percentage)}
                      variant="determinate"
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary"
                      }}
                    >
                      {percentage}%
                    </Typography>
                  </Stack>
                </ListItem>
              );
            })}
          </List>
        </Card>
      </CardContent>
    </Card>
  );
};
