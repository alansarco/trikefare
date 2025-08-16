// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

// React components
import SoftBox from "components/SoftBox";
import SoftButton from "components/SoftButton";
import SoftTypography from "components/SoftTypography";
import 'chart.js/auto';
// React examples
import DashboardLayout from "essentials/LayoutContainers/DashboardLayout";
import DashboardNavbar from "essentials/Navbars";
import Footer from "essentials/Footer";
import { ToastContainer, toast } from 'react-toastify';

// React base styles
import VisibilityTwoToneIcon from '@mui/icons-material/VisibilityTwoTone';
import CheckCircleTwoToneIcon from '@mui/icons-material/CheckCircleTwoTone';
// Data
import Edit from "layouts/reports/Edit";
import FixedLoading from "components/General/FixedLoading";
import { passToSuccessLogs, passToErrorLogs } from "components/Api/Gateway";

import React, { useState, useEffect } from "react";
import { useStateContext } from "context/ContextProvider";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { apiRoutes } from "components/Api/ApiRoutes";

import { useDashboardData } from "layouts/dashboard/data/dashboardRedux";
import { statusSelect } from "components/General/Utils";
import SoftInput from "components/SoftInput";
import { Icon } from "@mui/material";
import { reportStatusSelect, reportFromSelect } from "components/General/Utils";
import CustomPagination from "components/General/CustomPagination";
import SoftBadge from "components/SoftBadge";

function Reports() {
  const currentFileName = "layouts/reports/index.js";
  const {token, access, role, updateTokenExpiration} = useStateContext();
  updateTokenExpiration();
  if (!token) {
    return <Navigate to="/authentication/sign-in" />
  }

  const YOUR_ACCESS_TOKEN = token; 
  const headers = {
        'Authorization': `Bearer ${YOUR_ACCESS_TOKEN}`
  };

  const {authUser} = useDashboardData({
    authUser: true, 
    otherStats: false, 
    polls: false
  }, []);

  const [page, setPage] = useState(1);
  const [DATA, setRetrieveOne] = useState(); 
  const [reload, setReload] = useState(false);
  const [rendering, setRendering] = useState(1);
  const [fetchdata, setFetchdata] = useState([]);
  const [searchTriggered, setSearchTriggered] = useState(true);

  const initialState = {
      filter: "",
      report_status: "0",
      report_from: "",
  };
  
  const [formData, setFormData] = useState(initialState);
  
  const handleChange = (e) => {
      const { name, value, type } = e.target;
      setFormData({ ...formData, [name]: value });
      if (["report_status", "report_from"].includes(name)) {
        setSearchTriggered(true);
        setPage(1);
      }
  };
  
  const HandleRendering = (rendering) => {
    setRendering(rendering);
  };

  const handleUpdate = (id) => {
    setReload(true);
    axios.get(apiRoutes.retrieveReportOne, { params: { id }, headers })
      .then(response => {
        if (response.data.status === 200) {
          setRendering(2);
          setRetrieveOne(response.data.report);  
        } else {
          toast.error(`${response.data.message}`, { autoClose: true });
        }
        passToSuccessLogs(response.data, currentFileName);
        setReload(false);
      })  
      .catch(error => {
        passToErrorLogs(`Event not Fetched!  ${error}`, currentFileName);
        setReload(false);
      });
  };


  const ReloadTable = () => {
    axios.post(apiRoutes.retrieveReport + '?page=' + page, formData, {headers})
    .then(response => {
      setFetchdata(response.data.reports);
      passToSuccessLogs(response.data, currentFileName);
      setReload(false);
    })
    .catch(error => {
      passToErrorLogs(`Reports not Fetched!  ${error}`, currentFileName);
      setReload(false);
    });
  }

  useEffect(() => {
    if (searchTriggered) {
      setReload(true);
      axios.post(apiRoutes.retrieveReport + '?page=' + 1, formData, {headers})
        .then(response => {
          setFetchdata(response.data.reports);
          passToSuccessLogs(response.data, currentFileName);
          setReload(false);
        })
        .catch(error => {
          passToErrorLogs(`Reports not Fetched!  ${error}`, currentFileName);
          setReload(false);
        });
        setSearchTriggered(false);
    }
  }, [searchTriggered]);

  const handleSubmit = async (e) => {
        e.preventDefault(); 
        setReload(true);      
        try {
            const response = await axios.post(apiRoutes.retrieveReport + '?page=' + 1, formData, {headers});
            setFetchdata(response.data.reports);
            passToSuccessLogs(response.data, currentFileName);
            setReload(false);
        } catch (error) { 
            passToErrorLogs(error, currentFileName);
            setReload(false);
        }     
        setReload(false);
    };

  const handleDelete = async (id) => {
    Swal.fire({
      customClass: {
        title: 'alert-title',
        icon: 'alert-icon',
        confirmButton: 'alert-confirmButton',
        cancelButton: 'alert-cancelButton',
        container: 'alert-container',
        popup: 'alert-popup'
      },
      title: 'Delete Report?',
      text: "Are you sure you want to delete this? This action cannot be reverted!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',  
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, I confirm!'
    }).then((result) => {
      if (result.isConfirmed) {
        setSearchTriggered(true);
          if (!token) {
            toast.error(messages.prohibit, { autoClose: true });
          }
          else {  
            axios.get(apiRoutes.deleteReport, { params: { id }, headers })
              .then(response => {
                if (response.data.status == 200) {
                  toast.success(`${response.data.message}`, { autoClose: true });
                  setRendering(1);
                } else {
                  toast.error(`${response.data.message}`, { autoClose: true });
                }
                passToSuccessLogs(response.data, currentFileName);
                setSearchTriggered(true);
              })  
              .catch(error => {
                setSearchTriggered(true);
                toast.error("Cant delete report!", { autoClose: true });
                passToErrorLogs(error, currentFileName);
              });
          }
      }
    })
  };

  const handleReopen = async (id) => {
    Swal.fire({
      customClass: {
        title: 'alert-title',
        icon: 'alert-icon',
        confirmButton: 'alert-confirmButton',
        cancelButton: 'alert-cancelButton',
        container: 'alert-container',
        popup: 'alert-popup'
      },
      title: 'Re-open Report /Case?',
      text: "Are you sure you want to re-open this report?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',  
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, I confirm!'
    }).then((result) => {
      if (result.isConfirmed) {
        setSearchTriggered(true);
          if (!token) {
            toast.error(messages.prohibit, { autoClose: true });
          }
          else {  
            axios.get(apiRoutes.reopenReport, { params: { id }, headers })
              .then(response => {
                if (response.data.status == 200) {
                  toast.success(`${response.data.message}`, { autoClose: true });
                } else {
                  toast.error(`${response.data.message}`, { autoClose: true });
                }
                passToSuccessLogs(response.data, currentFileName);
                setSearchTriggered(true);
              })  
              .catch(error => {
                setSearchTriggered(true);
                toast.error("Cant reopen report!", { autoClose: true });
                passToErrorLogs(error, currentFileName);
              });
          }
      }
    })
  };

  const fetchNextPrevTasks = (link) => {
    const url = new URL(link);
    const nextPage = url.searchParams.get('page');
    setPage(nextPage ? parseInt(nextPage) : 1);
    setReload(true);      

    // Trigger the API call again with the new page
    axios.post(apiRoutes.retrieveReport  + '?page=' + nextPage, formData, {headers} )
    .then(response => {
      setFetchdata(response.data.reports);
      passToSuccessLogs(response.data, currentFileName);
      setReload(false);      
    })
    .catch(error => {
      setReload(false);      
      console.error('Error fetching data for the next page:', error);
    });
  };

  const renderPaginationLinks = () => (
    <CustomPagination fetchdata={fetchdata} fetchNextPrevTasks={fetchNextPrevTasks} />
  )

  return (
    <>
      {reload && <FixedLoading /> }
      <DashboardLayout>
        <DashboardNavbar RENDERNAV={rendering} />      
        {DATA && rendering == 2 ? 
            <Edit handleDelete={handleDelete} DATA={DATA} HandleRendering={HandleRendering} ReloadTable={ReloadTable} />       
          :
        <SoftBox p={2}>
            <SoftBox className="px-md-4 py-2 d-md-flex d-block" justifyContent="space-between" alignItems="center">
              <SoftBox>
                <SoftTypography className="text-uppercase text-secondary" variant="h6" >Report History</SoftTypography>
              </SoftBox>
              <SoftBox display="flex" justifyContent="end">
                <SoftBox component="form" role="form" className="px-md-0 px-2" onSubmit={handleSubmit}>
                  <Grid container spacing={1} py={1} pb={2}>  
                    <Grid item xs={12} className="d-block d-md-flex">
                        <SoftBox className="px-md-0 px-2" display="flex" margin="0" justifyContent="end">
                            <select className="form-select-sm text-secondary rounded-5 me-2 cursor-pointer border span" name="report_from" value={formData.report_from} onChange={handleChange} >
                                <option value="">All Reports</option>
                                <optgroup label="Reported by">
                                  {reportFromSelect && reportFromSelect.map((status) => (
                                      <option key={status.value} value={status.value}>
                                        {status.desc}
                                      </option>
                                    ))}
                                </optgroup>
                            </select>
                            <select className="form-select-sm text-secondary rounded-5 me-2 cursor-pointer border span" name="report_status" value={formData.report_status} onChange={handleChange} >
                                <option value="">All Status</option>
                                {reportStatusSelect && reportStatusSelect.map((status) => (
                                <option key={status.value} value={status.value}>
                                        {status.desc}
                                </option>
                                ))}
                            </select>
                            <SoftInput 
                                value={formData.filter}
                                onChange={handleChange}
                                placeholder="Search here..." name="filter" size="small"
                                icon={{
                                    component: 'search',
                                    direction: 'right',
                                }}
                            />
                            <SoftButton className="px-3 rounded-0 rounded-right" variant="gradient" color="error" size="medium" iconOnly type="submit">
                                <Icon>search</Icon>
                            </SoftButton>
                        </SoftBox>
                    </Grid>
                  </Grid>
                </SoftBox>
              </SoftBox>
            </SoftBox>
            {((fetchdata && fetchdata.data) &&  !fetchdata.data.length > 0 ) ?
              <Card className="bg-white rounded-5 mb-3">
                <SoftBox p={2} >
                  <SoftTypography mt={0} color="dark" fontSize="0.8rem" className="text-center">
                      Empty Reports
                  </SoftTypography> 
                </SoftBox>
              </Card>: ""
            }

            {fetchdata && fetchdata.data &&  fetchdata.data.map((report) => (
            <Card className="bg-white rounded-5 mb-3" key={report.reportid}>
              <SoftBox p={2} >
                <Grid container spacing={0} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <Grid container spacing={0} alignItems="center">
                      <Grid item xs={12}>
                        <SoftTypography variant="button" color={report.report_status == 1 ? "info" : "error"}> Booking ID:  </SoftTypography>
                        <SoftTypography variant="button" className="text-sm fw-bold"> {report.bookid} </SoftTypography>
                        <SoftBadge color={report.report_from == 1 ? "error" : "info"} size="xs" badgeContent={report.report_from == 1 ? "driver" : "commuter"} container />
                      </Grid>
                      <Grid item xs={12}>
                        <SoftTypography variant="button" className="">Passenger Email: </SoftTypography>
                        <SoftTypography variant="button" className="fw-normal"> {report.passengerid} </SoftTypography>
                      </Grid>  
                      <Grid item xs={12}>
                        <SoftTypography variant="button" className="">Passenger Contact: </SoftTypography>
                        <SoftTypography variant="button" className="fw-normal"> {report.passenger_contact} </SoftTypography>
                      </Grid>  
                      <Grid item xs={12}>
                        <SoftTypography variant="button" className="">Concern: </SoftTypography>
                        <SoftTypography variant="button" className="fw-normal"> {report.description} </SoftTypography>
                      </Grid>  
                    </Grid>
                  </Grid>  
                  <Grid item xs={12} md={6}>
                    <Grid container spacing={0} alignItems="center">
                      <Grid item xs={12}>
                        <SoftTypography variant="button" className="">Plate Number: </SoftTypography>
                        <SoftTypography variant="button" className="fw-normal"> {report.plate_number} </SoftTypography>
                      </Grid>  
                      <Grid item xs={12}>
                        <SoftTypography variant="button" className="">Name of Driver: </SoftTypography>
                        <SoftTypography variant="button" className="fw-normal"> {report.driver_name} </SoftTypography>
                      </Grid>  
                      <Grid item xs={12}>
                        <SoftTypography variant="button" className="">Date Reported: </SoftTypography>
                        <SoftTypography variant="button" className="fw-normal"> {report.report_datetime} </SoftTypography>
                      </Grid>  
                      <Grid item xs={12}>
                        <SoftBox mt={1} display="flex" justifyContent="end">
                            {report.report_status == 1 ?
                              <SoftButton onClick={() => handleReopen(report.reportid)} className="text-xxs py-0 me-2 px-3 rounded-pill" size="small" variant="gradient" color="info">
                                <CheckCircleTwoToneIcon /> Re-open
                              </SoftButton>  :
                              <SoftButton onClick={() => handleUpdate(report.reportid)} className="text-xxs py-0 me-2 px-3 rounded-pill" size="small" variant="gradient" color="error">
                                <VisibilityTwoToneIcon className="me-1" /> review 
                              </SoftButton>  
                            }
                        </SoftBox>
                      </Grid>  
                    </Grid>
                  </Grid>  
                </Grid> 
              </SoftBox>
            </Card>
            ))}
            {fetchdata && fetchdata.data && fetchdata.data.length > 0 && <SoftBox p={2}>{renderPaginationLinks()}</SoftBox>}
        </SoftBox>
        }
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

export default Reports;
