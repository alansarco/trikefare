// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Grid from "@mui/material/Grid";

// React components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";

// React examples
import PageLayout from "essentials/LayoutContainers/PageLayout";
import brand from "assets/images/tricycle.png";
import { latestversions } from "../version/version-data";
import { Link } from "react-router-dom";

function CoverLayout({ color, header, title, description, image, children }) {
  return (
    <PageLayout background="transnav">
      <SoftBox className="custom-bg" height={{ xs: "100%", md: "100vh" }}>
        {/* Upper Part */}
        <SoftBox display="flex" justifyContent="end" className="bg-light">
          <SoftTypography mb={0} component={Link} to="/software-versions" 
            className="text-sm text-right pe-5 pt-3 fw-bold" color="error">
            {latestversions}
          </SoftTypography>
        </SoftBox>
        <SoftBox className="d-flex justify-content-center align-items-center bg-light" height={{ xs: "300px", lg: "50%"}}>
          <SoftBox className="">
            <SoftBox className="d-flex justify-md-content-center">
              <SoftTypography  color="dark" className="my-auto fw-bold title-font" > Hi! </SoftTypography>
              <img className="ms-4 my-auto flip" src={brand} alt="Logo" width="80px" height="80px"></img>
            </SoftBox>
            <SoftTypography  color="dark" className=" text-center fw-bold title-font"> Welcome to </SoftTypography>
            <SoftTypography  color="dark" className="custom-red text-center mt-4 space-3 fw-bold title-font-1"> TRIKEFARE </SoftTypography>
          </SoftBox>
        </SoftBox>
        {/* Lowert Part */}
         <SoftBox className="d-flex justify-content-center" >
          <SoftBox className="my-3">
            <Grid
              className="m-auto shadow-lg rounded border"
              maxWidth={{ xs: "100%", md: "800px" }}
              justifyContent="center"
            >
              {/* Right Side */}
              <Grid item xs={12} md={6} className="bg-white d-flex justify-content-center py-2" minWidth={{ xs: "250px", sm: "400px", md: "700px" }}>
                <SoftBox className="">
                  <SoftBox  minWidth={{sm: "300px", md: "400px" }}  pt={0} px={3}>{children}</SoftBox>
                </SoftBox>
              </Grid>
            </Grid>
          </SoftBox>
        </SoftBox>
      </SoftBox>
    </PageLayout>
  );
}

// Setting default values for the props of CoverLayout
CoverLayout.defaultProps = {
  header: "",
  title: "",
  description: "",
  color: "warning",
  top: 20,
};

// Typechecking props for the CoverLayout
CoverLayout.propTypes = {
  color: PropTypes.oneOf([
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "dark",
    "light",
  ]),
  header: PropTypes.node,
  title: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.string.isRequired,
  top: PropTypes.number,
  children: PropTypes.node.isRequired,
};

export default CoverLayout;
