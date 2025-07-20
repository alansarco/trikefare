// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

// React components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import 'chart.js/auto';
import Icon from "@mui/material/Icon";
// React examples
import DashboardLayout from "essentials/LayoutContainers/DashboardLayout";
import DashboardNavbar from "essentials/Navbars";
import Footer from "essentials/Footer";
import { ToastContainer, toast } from 'react-toastify';
import typography from "assets/theme/base/typography";
// React base styles

// Data
import DefaultDoughnutChart from "essentials/Charts/DoughnutCharts/DefaultDoughnutChart";
import TimelineList from "essentials/Timeline/TimelineList";
import TimelineItem from "essentials/Timeline/TimelineItem";

import React, { useState } from "react";
import { useDashboardData } from 'layouts/dashboard/data/dashboardRedux';
import { useStateContext } from "context/ContextProvider";
import { Navigate } from "react-router-dom";
import GradientLineChart from "essentials/Charts/LineCharts/GradientLineChart";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';

function Dashboard() {
  const {token, access, updateTokenExpiration} = useStateContext();
  updateTokenExpiration();
  if (!token) {
    return <Navigate to="/authentication/sign-in" />
  }

  const { 
    authUser,
    otherStats , loadOtherStats,
  } = useDashboardData({
    authUser: true, 
    otherStats: true, 
  });  
  const { size } = typography;

  let currentpopulation = 0;
  let icon = "";
  let iconColor = "";
  let increase = "";
  let percentageChange = 0;
  if (otherStats && otherStats.populationCount) {
    // Get the current and last year population to compare
    const populationValues = Object.values(otherStats.populationCount);
    if (populationValues.length >= 2) {
      const lastyearpopulation = populationValues[populationValues.length - 2]; // Second last year population
      currentpopulation = populationValues[populationValues.length - 1]
  
      // Calculate percentage change
      percentageChange = (((currentpopulation - lastyearpopulation) / Math.abs(lastyearpopulation)) * 100).toFixed(2);
  
      // Set icon and color based on percentage change
      if (percentageChange > 0) {
        icon = "arrow_upward";
        iconColor = "info";
        increase = "more";
      } else if (percentageChange < 0) {
        icon = "arrow_downward";
        iconColor = "primary";
        increase = "decrease";
      } else {
        percentageChange = 0; // No change
        icon = "arrow_forward"; // Neutral change
        iconColor = "neutral"; // Neutral color
      }
    }
  }

  const formattedEvents = otherStats && otherStats.events && otherStats.events.map(event => ({
    title: event.title,
    start: new Date(event.start), // JavaScript will correctly parse the ISO string
    end: new Date(event.end),
    color: 
      event.color === "primary" ? "#cb0c9f" :
      event.color === "success" ?  "#82d616" :
      event.color === "warning" ? "#fbcf33" :
      event.color === "info" ? "#17c1e8" : "#344767",
  }));

  const eventStyleGetter = (event) => {
    const backgroundColor = event.color;
    const style = {
      backgroundColor,
      borderRadius: '5px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      fontSize: '15px',
      display: 'block'
    };
    return {
      style: style
    };
  };  
  const localizer = momentLocalizer(moment);


  const year = new Date().getFullYear();
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const todayFormatted = new Date().toLocaleDateString('en-US', options);
  return (
    <>
      <DashboardLayout>
        <DashboardNavbar RENDERNAV="1" />         
        <SoftBox px={2} py={3}>
          <SoftBox px={2} py={1} mb={2}>
            {authUser != "" && <SoftTypography variant="h4">Welcome back, <span className="text-danger text-gradient h4">{authUser.first_name}!</span> </SoftTypography>}
          </SoftBox>
          <SoftBox mb={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={7} xl={8}>
                {access >= 10 && 
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={12} xl={12}>
                    <GradientLineChart
                      title="Booking Statistics"
                      currentpopulation={currentpopulation}
                      description={
                        <SoftBox display="flex" alignItems="center">
                          <SoftBox fontSize={size.lg} color={iconColor} mb={0.3} mr={0.5} lineHeight={0}>
                            <Icon className="font-bold">{icon}</Icon>
                          </SoftBox>
                          <SoftTypography variant="button" color="text" fontWeight="medium">  
                            {percentageChange}% {increase}{" "}
                            <SoftTypography variant="button" color="text" fontWeight="regular">
                              in {todayFormatted}
                            </SoftTypography>
                          </SoftTypography>
                        </SoftBox>
                      } 
                      height="20rem"
                      loading={loadOtherStats}
                      chart={{ 
                        labels: otherStats && otherStats.populationCount ? Object.keys(otherStats.populationCount) : [],
                        datasets: [
                          {
                            label: "Rides",
                            color: "dark",
                              data: otherStats && otherStats.populationCount && Object.values(otherStats.populationCount),
                          },
                        ],
                      }}
                    />
                  </Grid>
                </Grid>
                }
                    
              </Grid>
              <Grid item xs={12} md={5} xl={4}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <DefaultDoughnutChart
                      title="Account Distribution"
                      nodata={Object.values(otherStats).every(value => value === "0")}
                      loading={loadOtherStats}
                      chart={{
                        labels: ["Admin", "Drivers", "Commuters"],  
                        datasets: {
                          label: "Elections",
                          backgroundColors: ["dark", "error", "info"],
                          data: [
                            otherStats.data1, 
                            otherStats.data2,otherStats.data3],

                        },
                      }}
                    />  
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </SoftBox>
        </SoftBox>
        <Footer />
      </DashboardLayout>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        limit={5}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable={false}
        theme="light"
      />
    </>
    
  );
}

export default Dashboard;
