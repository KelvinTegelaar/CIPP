export const getCippError = (data) => {
  if (data.response?.data?.result) {
    return data.response.data.result;
  }
  if (data.response?.data?.error) {
    return data.response.data.error;
  }
  if (data.response?.data?.message) {
    return data.response.data.message;
  }

  if (typeof data.response?.data === "string" && data.response.data.includes("<!DOCTYPE html>")) {
    return data.message;
  }

  if (data.response?.data?.Results) {
    return data.response.data.Results;
  }
  
  if (data.response?.data) {
    return data.response.data;
  }

  if (data.message) {
    return data.message;
  }
};
