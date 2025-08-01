import { forwardRef, createContext, useContext, useMemo } from "react";

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// React components
import SoftBox from "components/SoftBox";

// Custom styles for SoftPagination
import SoftPaginationItemRoot from "components/SoftPagination/SoftPaginationItemRoot";

// The Pagination main context
const Context = createContext(null);

const SoftPagination = forwardRef(
  ({ item, variant, color, size, active, children, ...rest }, ref) => {
    const context = item ? useContext(Context) : null;
    const paginationSize = context ? context.size : null;
    const value = useMemo(() => ({ variant, color, size }), [variant, color, size]);

    return (
      <Context.Provider value={value}>
        {item ? (
          <SoftPaginationItemRoot
            {...rest}
            ref={ref}
            variant={active ? context.variant : "outlined"}
            color={active ? context.color : "secondary"}
            iconOnly
            circular
            ownerState={{ variant, active, paginationSize }}
          >
            {children}
          </SoftPaginationItemRoot>
        ) : (
          <SoftBox
            display="flex"
            justifyContent="flex-end"
            alignItems="center"
            {{ listStyle: "none" }}
          >
            {children}
          </SoftBox>
        )}
      </Context.Provider>
    );
  }
);

// Setting default values for the props of SoftPagination
SoftPagination.defaultProps = {
  item: false,
  variant: "gradient",
  color: "info",
  size: "medium",
  active: false,
};

// Typechecking props for the SoftPagination
SoftPagination.propTypes = {
  item: PropTypes.bool,
  variant: PropTypes.oneOf(["gradient", "contained"]),
  color: PropTypes.oneOf([
    "white",
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "light",
    "dark",
  ]),
  size: PropTypes.oneOf(["small", "medium", "large"]),
  active: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

export default SoftPagination;
