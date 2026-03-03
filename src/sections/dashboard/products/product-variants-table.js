import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';
import CubeIcon from '@heroicons/react/24/outline/CubeIcon';
import {
  Avatar,
  Button,
  InputBase,
  Stack,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';
import { Scrollbar } from '../../../components/scrollbar';

const ProductVariantRow = (props) => {
  const { onQuantityChange, variant, ...other } = props;
  const [mode, setMode] = useState('add');
  const [quantity, setQuantity] = useState(0);

  const handleModeChange = useCallback((event, mode) => {
    if (mode) {
      setMode(mode);
    }
  }, []);

  const handleQuantityChange = useCallback((event) => {
    const value = +event.target.value;

    if (isNaN(value)) {
      return;
    }

    setQuantity(value);
  }, []);

  const handleQuantitySave = useCallback(() => {
    const newQuantity = mode === 'add'
      ? variant.quantity + quantity
      : variant.quantity - quantity;

    onQuantityChange?.(variant.id, newQuantity);
    setQuantity(0);
  }, [mode, variant, quantity, onQuantityChange]);

  const price = numeral(variant.price).format(`${variant.currency}0,0.00`);

  return (
    <TableRow {...other}>
      <TableCell>
        <Stack
          alignItems="center"
          direction="row"
          spacing={2}
        >
          <Avatar
            src={variant.image}
            variant="rounded"
          >
            <SvgIcon>
              <CubeIcon />
            </SvgIcon>
          </Avatar>
          <Typography
            color="inherit"
            variant="body2"
          >
            {variant.name}
          </Typography>
        </Stack>
      </TableCell>
      <TableCell>
        {variant.quantity}
      </TableCell>
      <TableCell>
        {price}
      </TableCell>
      <TableCell>
        {variant.sku}
      </TableCell>
      <TableCell sx={{ width: 333 }}>
        <Stack
          alignItems="center"
          direction="row"
          spacing={1}
        >
          <ToggleButtonGroup
            exclusive
            onChange={handleModeChange}
            value={mode}
          >
            <ToggleButton value="add">
              Add
            </ToggleButton>
            <ToggleButton value="set">
              Set
            </ToggleButton>
          </ToggleButtonGroup>
          <InputBase
            inputProps={{
              sx: {
                px: 1.5,
                py: 1.75
              }
            }}
            onChange={handleQuantityChange}
            sx={{
              borderColor: (theme) => theme.palette.mode === 'dark'
                ? 'neutral.700'
                : 'neutral.300',
              borderRadius: 1,
              borderStyle: 'solid',
              borderWidth: 1,
              maxHeight: 48
            }}
            type="number"
            value={quantity}
          />
          <Button
            onClick={handleQuantitySave}
            variant="contained"
          >
            Save
          </Button>
        </Stack>
      </TableCell>
    </TableRow>
  );
};

ProductVariantRow.propTypes = {
  onQuantityChange: PropTypes.func,
  variant: PropTypes.object.isRequired
};

export const ProductVariantsTable = (props) => {
  const { onQuantityChange, variants = [] } = props;

  return (
    <Scrollbar>
      <Table sx={{ minWidth: 900 }}>
        <TableHead>
          <TableRow>
            <TableCell>
              Variant
            </TableCell>
            <TableCell>
              Inventory
            </TableCell>
            <TableCell>
              Price
            </TableCell>
            <TableCell>
              SKU
            </TableCell>
            <TableCell>
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {variants.map((variant) => (
            <ProductVariantRow
              key={variant.id}
              onQuantityChange={onQuantityChange}
              variant={variant}
            />
          ))}
        </TableBody>
      </Table>
    </Scrollbar>
  );
};
