import { Box, Skeleton, Table, TableCell, TableHead, TableRow } from '@mui/material';
import { Scrollbar } from '../../../../components/scrollbar';

export const DataState1 = () => (
  <Box sx={{ p: 3 }}>
    <Scrollbar>
      <Table sx={{ minWidth: 600 }}>
        <TableHead>
          <TableRow>
            {['Name', 'Phone', 'Email', 'Create at', 'Actions'].map((column) => (
              <TableCell key={column}>
                {column}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
      </Table>
    </Scrollbar>
    <Box sx={{ p: 2 }}>
      <Skeleton height={42} />
      <Skeleton height={42} />
      <Skeleton height={42} />
    </Box>
  </Box>
);
