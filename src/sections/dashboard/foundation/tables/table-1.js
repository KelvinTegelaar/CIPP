import EllipsisVerticalIcon from '@heroicons/react/24/outline/EllipsisVerticalIcon';
import {
  Box,
  Checkbox,
  Divider,
  IconButton,
  Link,
  Stack,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography
} from '@mui/material';
import { Pagination } from '../../../../components/pagination';
import { Scrollbar } from '../../../../components/scrollbar';

export const Table1 = () => (
  <>
    <Scrollbar>
      <Table sx={{ minWidth: 600 }}>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox />
            </TableCell>
            <TableCell>
              <TableSortLabel>
                Order
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel>
                Invoice date
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel>
                Due date
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel>
                Total
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel>
                Payment method
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel>
                Status
              </TableSortLabel>
            </TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow hover>
            <TableCell padding="checkbox">
              <Checkbox />
            </TableCell>
            <TableCell>
              <Link
                color="inherit"
                href="typescript/src/sections/dashboard/foundation#"
                underline="none"
                variant="subtitle2"
              >
                #DEV5437
              </Link>
            </TableCell>
            <TableCell>
              02 Jun 2021
            </TableCell>
            <TableCell>
              02 Jun 2021
            </TableCell>
            <TableCell>
              $100.00
            </TableCell>
            <TableCell>
              Credit Card
            </TableCell>
            <TableCell>
              <Stack
                alignItems="center"
                direction="row"
                spacing={1}
              >
                <Box
                  sx={{
                    backgroundColor: 'info.main',
                    borderRadius: '50%',
                    height: 8,
                    width: 8
                  }}
                />
                <Typography
                  color="info.main"
                  variant="body2"
                >
                  Ongoing
                </Typography>
              </Stack>
            </TableCell>
            <TableCell>
              <IconButton>
                <SvgIcon fontSize="small">
                  <EllipsisVerticalIcon />
                </SvgIcon>
              </IconButton>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Scrollbar>
    <Divider />
    <Pagination
      rowsCount={1}
      page={0}
      rowsPerPage={10}
    />
  </>
);
