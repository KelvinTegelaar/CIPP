import SignInErrorCodes from "/src/data/signInErrorCodes";

export const getSignInErrorCodeTranslation = (errorCode) => {
  if (SignInErrorCodes.hasOwnProperty(String(errorCode))) {
    return SignInErrorCodes[String(errorCode)];
  } else {
    return errorCode;
  }
};
