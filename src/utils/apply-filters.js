// NOTE: In really you'll use server filter, but you can also use this to filter the data on client.

const contains = (rowValue, filterValue) => {
  if (!rowValue) {
    return false;
  }

  return rowValue.toLowerCase().includes(filterValue.toLowerCase());
};

const endsWith = (rowValue, filterValue) => {
  if (!rowValue) {
    return false;
  }

  return rowValue.substring(rowValue.length - filterValue.length) === filterValue;
};

const equals = (rowValue, filterValue) => {
  if (!rowValue) {
    return false;
  }

  // Here we evaluate == instead of === because values can be number | string
  // eslint-disable-next-line eqeqeq
  return rowValue == filterValue;
};

const greaterThan = (rowValue, filterValue) => {
  if (!rowValue) {
    return false;
  }

  return rowValue > filterValue;
};

const isAfter = (rowValue, filterValue) => {
  if (!rowValue) {
    return false;
  }

  return new Date(rowValue).getTime() > new Date(filterValue).getTime();
};

const isBlank = (rowValue) => {
  if (rowValue === null || typeof rowValue === 'undefined') {
    return true;
  }

  return false;
};

const isPresent = (rowValue) => {
  if (rowValue === null || typeof rowValue === 'undefined') {
    return false;
  }

  return true;
};

const lessThan = (rowValue, filterValue) => {
  if (!rowValue) {
    return false;
  }

  return rowValue < filterValue;
};

const isBefore = (rowValue, filterValue) => {
  if (!rowValue) {
    return false;
  }

  return new Date(rowValue).getTime() < new Date(filterValue).getTime();
};

const notContains = (rowValue, filterValue) => {
  if (!rowValue) {
    return false;
  }

  return !rowValue.includes(filterValue);
};

const notEqual = (rowValue, filterValue) => {
  if (!rowValue) {
    return false;
  }

  return rowValue !== filterValue;
};

const startsWith = (rowValue, filterValue) => {
  if (!rowValue) {
    return false;
  }

  return rowValue.substring(0, filterValue.length) === filterValue;
};

const checkFilter = (rowValue, filter) => {
  switch (filter.operator) {
    case 'contains':
      return contains(rowValue, filter.value);

    case 'endsWith':
      return endsWith(rowValue, filter.value);

    case 'equals':
      return equals(rowValue, filter.value);

    case 'greaterThan':
      return greaterThan(rowValue, filter.value);

    case 'isAfter':
      return isAfter(rowValue, filter.value);

    case 'isBefore':
      return isBefore(rowValue, filter.value);

    case 'isBlank':
      return isBlank(rowValue);

    case 'isPresent':
      return isPresent(rowValue);

    case 'lessThan':
      return lessThan(rowValue, filter.value);

    case 'notContains':
      return notContains(rowValue, filter.value);

    case 'notEqual':
      return notEqual(rowValue, filter.value);

    case 'startsWith':
      return startsWith(rowValue, filter.value);

    default:
      throw new Error('Provided an unknown filter operator');
  }
};

export const applyFilters = (rows, filters = []) => {
  if (filters.length === 0) {
    return rows;
  }

  return rows.filter((row) => {
    let passedAll = true;

    for (let i = 0; i < filters.length; i++) {
      const filter = filters[i];
      const rowValue = row[filter.property];
      let passed = true;

      try {
        passed = checkFilter(rowValue, filter);
      } catch (err) {
        console.warn('[Apply Filters] Skipped filter due to error', err);
      }

      if (!passed) {
        passedAll = false;
        break;
      }
    }

    return passedAll;
  });
};
