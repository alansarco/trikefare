import { useState, useEffect } from "react";

// @mui material components
import Divider from "@mui/material/Divider";
import Switch from "@mui/material/Switch";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Icon from "@mui/material/Icon";

// @mui icons
import TwitterIcon from "@mui/icons-material/Twitter";
import FacebookIcon from "@mui/icons-material/Facebook";

// React components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftButton from "components/SoftButton";

// Custom styles for the Configurator
import ConfiguratorRoot from "essentials/Configurator/ConfiguratorRoot";

// React context
import {
  useSoftUIController,
  setOpenConfigurator,  
} from "context";
import { useDashboardData } from "layouts/dashboard/data/dashboardRedux";
import SoftBadge from "components/SoftBadge";
import { useNavigate } from "react-router-dom";
import { useStateContext } from "context/ContextProvider";

function Configurator() {
  const [controller, dispatch] = useSoftUIController();
  const { openConfigurator} = controller;
  const [disabled, setDisabled] = useState(false);
  const {user, access} = useStateContext();
  
  const {polls} = useDashboardData({
    // polls: true, 
  });
  const navigate = useNavigate(); 
  
  const handleViewRequest = () => {
    setOpenConfigurator(dispatch, false); 
    navigate("/reports");  
  };
  // Use the useEffect hook to change the button state for the sidenav type based on window size.
  useEffect(() => {
    // A function that sets the disabled state of the buttons for the sidenav type.
    function handleDisabled() {
      return window.innerWidth > 1200 ? setDisabled(false) : setDisabled(true);
    }

    // The event listener that's calling the handleDisabled function when resizing the window.
    window.addEventListener("resize", handleDisabled);

    // Call the handleDisabled function to set the state with the initial value.
    handleDisabled();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleDisabled);
  }, []);
  const handleCloseConfigurator = () => setOpenConfigurator(dispatch, false); 
  return (
    <ConfiguratorRoot variant="permanent" ownerState={{ openConfigurator }}>
      <SoftBox
        display="flex"
        justifyContent="space-between"
        alignItems="baseline"
        pt={3}
        pb={0.8}
        px={3}  
      >
        <SoftBox>
          <SoftTypography variant="h5">Reports</SoftTypography>
          <SoftTypography variant="body2" color="text">
            {polls && polls.length > 0 ? "Pending Reports" : "No Pending Reports"}
            
          </SoftTypography>
        </SoftBox>

        <Icon
          sx={({ typography: { size, fontWeightBold }, palette: { dark } }) => ({
            fontSize: `${size.md} !important`,
            fontWeight: `${fontWeightBold} !important`,
            stroke: dark.main,
            strokeWidth: "2px",
            cursor: "pointer",
            mt: 2,
          })}
          onClick={handleCloseConfigurator}
        >
          close
        </Icon>
      </SoftBox>
      <Divider />
      {polls && polls.length > 0 && polls.map((poll) => (
      <SoftBox key={poll.reportid} py={2} px={3} className="border-bottom SoftBox cursor-pointer" onClick={handleViewRequest}>
          <SoftBox display="">
            <SoftTypography className="text-xs" color="dark" ><b>Booking ID: </b>{poll.bookid}</SoftTypography>
            <SoftTypography variant="h6" color="secondary" className="text-xxs">{poll.passengerid}</SoftTypography>
            <SoftTypography variant="h6" color="error" className="">{poll.description}</SoftTypography>
          </SoftBox>
          <SoftBox display="flex">
            {/* contained */}
          </SoftBox>
          <SoftBox mt={1}>
            <SoftTypography className="text-xxs" color="dark" >{poll.report_datetime}</SoftTypography>
          </SoftBox> 
          
        </SoftBox>
       ))}
           
    </ConfiguratorRoot>
  );
}

export default Configurator;
