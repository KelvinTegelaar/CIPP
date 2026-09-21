import { useCallback } from 'react';
import { CippIcons } from '../utils/icon-registry';
import PropTypes from 'prop-types';
import { Box, IconButton, Stack, SvgIcon, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const PaginationRoot = styled('div')((({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  padding: theme.spacing(2)
})));

export const Pagination = (props) => {
  const { disabled, onPageChange, page = 0, rowsCount = 0, rowsPerPage = 0, ...other } = props;
  const pagesCount = Math.ceil(rowsCount / rowsPerPage) || 1;
  const isFirstPage = page === 0;
  const isLastPage = (page + 1) === pagesCount;

  const handlePreviousPage = useCallback(() => {
    onPageChange?.(page - 1);
  }, [page, onPageChange]);

  const handleNextPage = useCallback(() => {
    onPageChange?.(page + 1);
  }, [page, onPageChange]);

  return (
    <PaginationRoot {...other}>
      <Box sx={{ flexGrow: 1 }}>
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            whiteSpace: "nowrap",
            alignItems: 'center',
            display: 'flex'
          }}>
          Page
          {' '}
          <Typography
            component="span"
            sx={{ mx: 1 }}
            variant="subtitle2"
          >
            {page + 1}
          </Typography>
          of
          {' '}
          <Typography
            component="span"
            sx={{ ml: 1 }}
            variant="subtitle2"
          >
            {pagesCount}
          </Typography>
        </Typography>
      </Box>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          alignItems: "center"
        }}
      >
        <IconButton
          disabled={isFirstPage || disabled}
          onClick={handlePreviousPage}
        >
          <SvgIcon fontSize="small">
            <CippIcons.ChevronLeftIcon />
          </SvgIcon>
        </IconButton>
        <IconButton
          disabled={isLastPage || disabled}
          onClick={handleNextPage}
        >
          <SvgIcon fontSize="small">
            <CippIcons.ChevronRightIcon />
          </SvgIcon>
        </IconButton>
      </Stack>
    </PaginationRoot>
  );
};

Pagination.propTypes = {
  disabled: PropTypes.bool,
  onPageChange: PropTypes.func,
  page: PropTypes.number,
  rowsCount: PropTypes.number,
  rowsPerPage: PropTypes.number
};
