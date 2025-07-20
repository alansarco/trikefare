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
import Edit from "layouts/news/Edit";
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
import CustomPagination from "components/General/CustomPagination";
import BorderColorTwoToneIcon from '@mui/icons-material/BorderColorTwoTone';
import Add from "layouts/news/Add";
import { asofSelect } from "components/General/Utils";

function News() {
  const currentFileName = "layouts/news/index.js";
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
      asof: "today",
  };
  
  const [formData, setFormData] = useState(initialState);
  
  const handleChange = (e) => {
      const { name, value, type } = e.target;
      setFormData({ ...formData, [name]: value });
      if (["asof"].includes(name)) {
        setSearchTriggered(true);
        setPage(1);
      }
  };
  
  const HandleRendering = (rendering) => {
    setRendering(rendering);
  };

  const handleUpdate = (id) => {
    setReload(true);
    axios.get(apiRoutes.retrieveNewsOne, { params: { id }, headers })
      .then(response => {
        if (response.data.status === 200) {
          setRendering(2);
          setRetrieveOne(response.data.news);  
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
    axios.post(apiRoutes.retrieveNews + '?page=' + page, formData, {headers})
    .then(response => {
      setFetchdata(response.data.news);
      passToSuccessLogs(response.data, currentFileName);
      setReload(false);
    })
    .catch(error => {
      passToErrorLogs(`News not Fetched!  ${error}`, currentFileName);
      setReload(false);
    });
  }

  useEffect(() => {
    if (searchTriggered) {
      setReload(true);
      axios.post(apiRoutes.retrieveNews + '?page=' + 1, formData, {headers})
        .then(response => {
          setFetchdata(response.data.news);
          passToSuccessLogs(response.data, currentFileName);
          setReload(false);
        })
        .catch(error => {
          passToErrorLogs(`News not Fetched!  ${error}`, currentFileName);
          setReload(false);
        });
        setSearchTriggered(false);
    }
  }, [searchTriggered]);

  const handleSubmit = async (e) => {
        e.preventDefault(); 
        setReload(true);      
        try {
            const response = await axios.post(apiRoutes.retrieveNews + '?page=' + 1, formData, {headers});
            setFetchdata(response.data.news);
            passToSuccessLogs(response.data, currentFileName);
            setReload(false);
        } catch (error) { 
            passToErrorLogs(error, currentFileName);
            setReload(false);
        }     
        setReload(false);
    };

  const handleDelete = async (id) => {
    console.log(id)
    Swal.fire({
      customClass: {
        title: 'alert-title',
        icon: 'alert-icon',
        confirmButton: 'alert-confirmButton',
        cancelButton: 'alert-cancelButton',
        container: 'alert-container',
        popup: 'alert-popup'
      },
      title: 'Delete News?',
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
            axios.get(apiRoutes.deleteNews, { params: { id }, headers })
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
                toast.error("Cant delete news!", { autoClose: true });
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
    axios.post(apiRoutes.retrieveNews  + '?page=' + nextPage, formData, {headers} )
    .then(response => {
      setFetchdata(response.data.news);
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
          rendering == 3 ?
            <Add HandleRendering={HandleRendering} ReloadTable={ReloadTable}  />
        :   
        <SoftBox p={2}>
            <SoftBox className="px-md-4 py-2 d-md-flex d-block" justifyContent="space-between" alignItems="center">
              <SoftBox>
                  <SoftTypography className="text-uppercase text-secondary" variant="h6" >News Fare</SoftTypography>
              </SoftBox>
              <SoftBox display="flex">
                <SoftBox component="form" role="form" className="px-md-0 px-2" onSubmit={handleSubmit}>
                  <Grid container spacing={1} py={1} pb={2}>  
                    <Grid item xs={12} className="d-block d-md-flex">
                        <SoftBox className="px-md-0 px-2" display="flex" margin="0" justifyContent="end">
                          <select className="form-select-sm text-secondary rounded-5 me-2 cursor-pointer border span" name="asof" value={formData.asof} onChange={handleChange} >
                            <option value="">All</option>
                            {asofSelect && asofSelect.map((status) => (
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
                            <SoftButton onClick={() => setRendering(3)} className="ms-2 py-0 px-md-3 px-5 d-flex rounded-pill text-nowrap" variant="gradient"   color="error" size="small" >
                                <Icon>add</Icon> Create New 
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
                      Empty
                  </SoftTypography> 
                </SoftBox>
              </Card>: ""
            }

            {fetchdata && fetchdata.data &&  fetchdata.data.map((news) => (
            <Card className="bg-white rounded-5 mb-3" key={news.newsid} >
              <SoftTypography variant="button" fontWeight="regular" color="text" className="text-xxxs text-end pt-2 px-2" >
                <b>Created:</b> {news.date_posted}
              </SoftTypography>
              <SoftTypography variant="button" fontWeight="regular" color="text" className="text-xxxs text-end px-2" >
                <b>Updated:</b> {news.date_updated}
              </SoftTypography>
              <SoftBox p={2} display="flex" alignItems="center" style={{ minHeight: 200 }}>
                <Grid container spacing={0} alignItems="center">
                  <Grid item xs={12}>
                    <SoftTypography variant="button" fontWeight="regular" color="text" className="text-xs text-center" >
                      <div dangerouslySetInnerHTML={{ __html: news.details }} />
                    </SoftTypography>
                    <SoftBox mt={1} display="flex" justifyContent="end">
                        <SoftButton onClick={() => handleUpdate(news.newsid)} className="text-xxxs me-2 px-3 rounded-pill" size="medium" variant="gradient" color="dark" iconOnly>
                            <BorderColorTwoToneIcon className="me-1" />
                        </SoftButton>  
                    </SoftBox>
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

export default News;
