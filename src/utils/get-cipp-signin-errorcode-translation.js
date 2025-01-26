import SignInErrorCodes from "/src/data/signinErrorCodes";

export const getSignInErrorCodeTranslation = (errorCode) => {
  if (SignInErrorCodes.hasOwnProperty(String(errorCode))) {
    return SignInErrorCodes[String(errorCode)];
  } else {
    return errorCode;
  }
};
