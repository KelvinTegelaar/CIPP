export const getCippError = (data) => {
  //if type is 'text' return the error message as a string, this still needs be expanded to handle all cases.
  if (data.response?.data.result) {
    return data.response.data.result;
  }
  if (data.response?.data.error) {
    return data.response.data.error;
  }
  if (data.response?.data.message) {
    return data.response.data.message;
  }
  if (data.response?.data.includes("<!DOCTYPE html>")) {
    return data.message;
  }

  if (data.response?.data) {
    return data.response.data;
  }

  if (data.message) {
    return data.message;
  }
};
