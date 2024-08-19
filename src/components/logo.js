import PropTypes from "prop-types";
import Image from "next/image";

export const Logo = (props) => {
  return <img src="/logo.png" alt="Logo" />;
};

Logo.propTypes = {
  color: PropTypes.oneOf(["black", "primary", "white"]),
};
