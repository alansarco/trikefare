import { useEffect } from "react";

// react-router-dom components
import { useLocation } from "react-router-dom";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// React components
import SoftBox from "components/SoftBox";

// React context
import { useSoftUIController, setLayout } from "context";

function PageLayout({ background, children }) {
  const [, dispatch] = useSoftUIController();
  const { pathname } = useLocation();

  useEffect(() => {
    setLayout(dispatch, "page");
  }, [pathname]);

  return (
    <SoftBox
      width="100%"
      height="100%"
      minHeight="100vh"
      bgColor={background}
      sx={{ overflowX: "hidden" }}
    >
      {children}
    </SoftBox>
  );
}

// Setting default values for the props for PageLayout
PageLayout.defaultProps = {
  background: "default",
};

// Typechecking props for the PageLayout
PageLayout.propTypes = {
  background: PropTypes.oneOf(["white", "light", "default", "transnav"]),
  children: PropTypes.node.isRequired,
};

export default PageLayout;
