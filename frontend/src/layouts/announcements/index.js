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
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import Icon from "@mui/material/Icon";
import BorderColorTwoToneIcon from '@mui/icons-material/BorderColorTwoTone';
// Data
import TimelineList from "essentials/Timeline/TimelineList";
import TimelineItem from "essentials/Timeline/TimelineItem";
import Add from "layouts/announcements/components/Add";
import Edit from "layouts/announcements/components/Edit";
import FixedLoading from "components/General/FixedLoading";
import { passToSuccessLogs, passToErrorLogs } from "components/Api/Gateway";

import React, { useState, useEffect } from "react";
import { useStateContext } from "context/ContextProvider";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { apiRoutes } from "components/Api/ApiRoutes";

import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import CalendarMonthTwoToneIcon from '@mui/icons-material/CalendarMonthTwoTone';
import ListTwoToneIcon from '@mui/icons-material/ListTwoTone';
import CustomPagination from "components/General/CustomPagination";
import SoftInput from "components/SoftInput";

function Announcements() {
  const currentFileName = "layouts/announcements/index.js";
  const {token, access, role, updateTokenExpiration} = useStateContext();
  updateTokenExpiration();
  if (!token) {
    return <Navigate to="/authentication/sign-in" />
  }

  const YOUR_ACCESS_TOKEN = token; 
  const headers = {
        'Authorization': `Bearer ${YOUR_ACCESS_TOKEN}`
  };
  const [page, setPage] = useState(1);
  const [DATA, setRetrieveOne] = useState(); 
  const [reload, setReload] = useState(false);
  const [rendering, setRendering] = useState(1);
  const [fetchdata, setFetchdata] = useState([]);
  const [searchTriggered, setSearchTriggered] = useState(true);
  const [events, setEvents] = useState([]);
  const [list, setList] = useState(true);

  const initialState = {
          filter: "",
      };
  
  const [formData, setFormData] = useState(initialState);
  
  const handleChange = (e) => {
      const { name, value, type } = e.target;
      setFormData({ ...formData, [name]: value });
  };

  const HandleRendering = (rendering) => {
    setRendering(rendering);
  };

  const handleUpdate = (id) => {
    setReload(true);
    axios.get(apiRoutes.retrieveAnnouncementOne, { params: { id }, headers })
      .then(response => {
        if (response.data.status === 200) {
          setRendering(2);
          setRetrieveOne(response.data.calendar);  
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
    axios.post(apiRoutes.retrieveAnnouncement + '?page=' + page, formData, {headers})
    .then(response => {
      setFetchdata(response.data.calendars.announcementlist);
      setEvents(response.data.calendars.events);
      passToSuccessLogs(response.data, currentFileName);
      setReload(false);
    })
    .catch(error => {
      passToErrorLogs(`Calendars not Fetched!  ${error}`, currentFileName);
      setReload(false);
    });
  }

  const formattedEvents = events.map(event => ({
    title: event.title,
    start: new Date(event.start), // JavaScript will correctly parse the ISO string
    end: new Date(event.end),
    color: 
      event.color === "primary" ? "#cb0c9f" :
      event.color === "success" ?  "#82d616" :
      event.color === "warning" ? "#fbcf33" :
      event.color === "info" ? "#17c1e8" : "#344767",
  }));

  useEffect(() => {
    if (searchTriggered) {
      setReload(true);
      axios.post(apiRoutes.retrieveAnnouncement + '?page=' + 1, formData, {headers})
        .then(response => {
          setFetchdata(response.data.calendars.announcementlist);
          setEvents(response.data.calendars.events);
          passToSuccessLogs(response.data, currentFileName);
          setReload(false);
        })
        .catch(error => {
          passToErrorLogs(`Calendars not Fetched!  ${error}`, currentFileName);
          setReload(false);
        });
        setSearchTriggered(false);
    }
  }, [searchTriggered]);

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
      title: 'Delete Announcent?',
      text: "Are you sure you want to delete this data? You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',  
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setSearchTriggered(true);
          if (!token) {
            toast.error(messages.prohibit, { autoClose: true });
          }
          else {  
            axios.get(apiRoutes.deleteAnnouncement, { params: { id }, headers })
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
                toast.error("Cant delete announcement!", { autoClose: true });
                passToErrorLogs(error, currentFileName);
              });
          }
      }
    })
  };

  const handleSubmit = async (e) => {
      e.preventDefault(); 
      setReload(true);      
      try {
          const response = await axios.post(apiRoutes.retrieveAnnouncement + '?page=' + 1, formData, {headers});
          setFetchdata(response.data.calendars.announcementlist);
          passToSuccessLogs(response.data, currentFileName);
          setReload(false);
      } catch (error) { 
          passToErrorLogs(error, currentFileName);
          setReload(false);
      }     
      setReload(false);
  };

  const fetchNextPrevTasks = (link) => {
    const url = new URL(link);
    const nextPage = url.searchParams.get('page');
    setPage(nextPage ? parseInt(nextPage) : 1);
    setReload(true);      

    // Trigger the API call again with the new page
    axios.post(apiRoutes.retrieveAnnouncement  + '?page=' + nextPage, formData, {headers} )
    .then(response => {
      setFetchdata(response.data.calendars.announcementlist);
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
            <Edit DATA={DATA} HandleRendering={HandleRendering} ReloadTable={ReloadTable} />       
          :
          rendering == 3 ?
            <Add HandleRendering={HandleRendering} ReloadTable={ReloadTable}  />
        :   
        <SoftBox p={2}>
            <SoftBox className="px-md-4 px-3 py-2 d-md-flex d-block" justifyContent="space-between" alignItems="center">
                <SoftBox>
                    <SoftTypography className="text-uppercase text-secondary" variant="h6" >Announcements</SoftTypography>
                </SoftBox>
                <SoftBox className="d-flex" justifyContent="end">
                    {!list && 
                    <SoftBox component="form" role="form" className="px-md-0" onSubmit={handleSubmit}>
                        <SoftBox className="px-md-0 px-0" display="flex" margin="0" justifyContent="end">
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
                      </SoftBox>
                    }
                    
                    <SoftButton onClick={() => setList(!list)} className="ms-2 py-0 px-3 d-flex rounded-pill" variant="gradient" color="dark" size="medium" iconOnly >
                      {list ? 
                        <> <ListTwoToneIcon /> </>
                         :
                        <> <CalendarMonthTwoToneIcon /> </>
                      }
                    </SoftButton>
                    <SoftButton onClick={() => setRendering(3)} className="ms-2 py-0 px-md-3 px-4 d-flex rounded-pill text-nowrap" variant="gradient" color="error" size="small" >
                      <Icon>add</Icon> Create New 
                    </SoftButton>
                    
                </SoftBox>
            </SoftBox>
            {list &&
            <Card className="bg-white rounded-5 mb-3">
              <SoftBox className="p-4">
                <Calendar
                  localizer={localizer}
                  events={formattedEvents}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: 500 }}
                  eventPropGetter={eventStyleGetter} // Apply custom styles
                />
              </SoftBox>
            </Card>
            }
            {!list &&
              <Card className="bg-white rounded-5">
                <SoftBox mb={3} p={2} >
                    <Grid container spacing={3}>
                        <Grid item xs={12} >
                          <TimelineList shadow="shadow-none" className="bg-success" title="Please be guided with the announcements below."  >
                              {((fetchdata && fetchdata.data) && !fetchdata.data.length > 0 ) ?
                              <SoftTypography mt={0} color="dark" fontSize="0.8rem" className="text-center">
                                  Empty
                              </SoftTypography> : ""
                              }
                              {fetchdata && fetchdata.data && 
                              fetchdata.data.map((event) => (
                              <React.Fragment key={event.id}> {/* Correctly using fragment with a key */}
                                <TimelineItem
                                  color={event.color}
                                  icon="payment"
                                  title={event.event_name}
                                  dateTime={event.event_datetime} 
                                  dateTimeEnd={event.event_datetime_end} 
                                  description={event.description}
                                  details={event.details}
                                />
                                {access == 999 && role === "ADMIN" && !event.past &&
                                 <SoftBox mt={2} display="flex" justifyContent="end">
                                  <SoftButton onClick={() => handleDelete(event.id)} className="text-xxxs me-2 px-3 rounded-pill" size="medium" variant="gradient" color="primary" iconOnly>
                                    <DeleteTwoToneIcon /> 
                                  </SoftButton>
                                  <SoftButton onClick={() => handleUpdate(event.id)} className="text-xxxs me-2 px-3 rounded-pill" size="medium" variant="gradient" color="dark" iconOnly>
                                    <BorderColorTwoToneIcon />
                                  </SoftButton>
                                </SoftBox>
                                }
                              </React.Fragment>
                              )
                              )}
                          </TimelineList>
                        </Grid>
                    </Grid>
                    {fetchdata && fetchdata.data && fetchdata.data.length > 0 && <SoftBox p={2}>{renderPaginationLinks()}</SoftBox>}
                </SoftBox>
              </Card>
            }
            
            
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

export default Announcements;
