// React components
import { Checkbox, Grid} from "@mui/material";
import FixedLoading from "components/General/FixedLoading";
import SoftBox from "components/SoftBox";
import SoftButton from "components/SoftButton";
import SoftInput from "components/SoftInput";
import SoftTypography from "components/SoftTypography";
import { useState } from "react";
import { toast } from "react-toastify";
import { messages } from "components/General/Messages";
import { useStateContext } from "context/ContextProvider";
import { passToErrorLogs, passToSuccessLogs  } from "components/Api/Gateway";
import axios from "axios";
import { apiRoutes } from "components/Api/ApiRoutes";
import { prioritySelect,currentDate  } from "components/General/Utils";
import { reportSelectStatus } from "components/General/Utils";
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import ReplyTwoToneIcon from '@mui/icons-material/ReplyTwoTone';

function Edit({DATA, HandleRendering, ReloadTable, handleDelete }) {
    const currentFileName = "layouts/announcements/components/Edit/index.js";
    const [submitProfile, setSubmitProfile] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const {token, access} = useStateContext();  

    const YOUR_ACCESS_TOKEN = token; 
    const headers = {
        'Authorization': `Bearer ${YOUR_ACCESS_TOKEN}`
    };

    const initialState = {
        id: DATA.feedbackid,
  };

    const [formData] = useState(initialState);

    const handleCancel = () => {
        HandleRendering(1);
        ReloadTable();
    };
        
    return (  
    <>
        {submitProfile && <FixedLoading />}   
        <SoftBox mt={5} mb={3} px={2}>      
            {openModal && (
                <div
                    style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 9999
                    }}
                    onClick={() => setOpenModal(false)}
                >
                <img
                src={`data:image/*;base64,${DATA.driverpic}`}
                alt="enlarged"
                style={{ maxHeight: '90vh', maxWidth: '90vw' }}
                />
            </div>
            )}
            <SoftBox mb={5} p={4} className="shadow-sm rounded-4 bg-white">
                <SoftBox>
                    <SoftBox className="px-md-0 px-2">
                        <SoftTypography fontWeight="medium" textTransform="capitalize" color="error" textGradient>
                                Booking Information    
                        </SoftTypography>
                        <input type="hidden" name="id" value={formData.feedbackid} size="small" /> 
                        <Grid container spacing={0} alignItems="start">
                            <Grid item xs={12} md={6}>
                                <Grid container spacing={0} alignItems="center">
                                    <Grid item xs={12}>
                                        <SoftTypography variant="button" >Booking ID: </SoftTypography>
                                        <SoftTypography variant="button" className="fw-normal"> {DATA.bookid} </SoftTypography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <SoftTypography variant="button" className="">Passenger Name: </SoftTypography>
                                        <SoftTypography variant="button" className="fw-normal"> {DATA.passenger_name} </SoftTypography>
                                    </Grid>  
                                    <Grid item xs={12}>
                                        <SoftTypography variant="button" className="">Passenger Email: </SoftTypography>
                                        <SoftTypography variant="button" className="fw-normal"> {DATA.passengerid} </SoftTypography>
                                    </Grid>  
                                    <Grid item xs={12}>
                                        <SoftTypography variant="button" className="">Passenger Contact: </SoftTypography>
                                        <SoftTypography variant="button" className="fw-normal"> {DATA.passenger_contact} </SoftTypography>
                                    </Grid>  
                                    <Grid item xs={12}>
                                        <SoftTypography variant="button" className="">Passenger Address: </SoftTypography>
                                        <SoftTypography variant="button" className="fw-normal"> {DATA.passenger_address} </SoftTypography>
                                    </Grid>  
                                    <Grid item xs={12}>
                                        <SoftTypography variant="button" className="">Destination FROM: </SoftTypography>
                                        <SoftTypography variant="button" className="fw-normal"> {DATA.location_from} </SoftTypography>
                                    </Grid>  
                                    <Grid item xs={12}>
                                        <SoftTypography variant="button" className="">Destination TO: </SoftTypography>
                                        <SoftTypography variant="button" className="fw-normal"> {DATA.location_to} </SoftTypography>
                                    </Grid> 
                                    <Grid item xs={12}>
                                        <SoftTypography variant="button" className="">Date Booked: </SoftTypography>
                                        <SoftTypography variant="button" className="fw-normal"> {DATA.booking_datetime} </SoftTypography>
                                    </Grid>  
                                    <Grid item xs={12}>
                                        <SoftTypography variant="button" className="">Fare: </SoftTypography>
                                        <SoftTypography variant="button" className="fw-normal"> ₱{DATA.fare} </SoftTypography>
                                    </Grid>  
                                </Grid>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Grid container spacing={0} alignItems="center">
                                    <Grid item xs={12}>
                                        <SoftTypography textGradient color="info" className="text-center text-sm fw-bold">Driver Information</SoftTypography>
                                        <SoftBox display="flex">
                                        <img
                                            src={`data:image/*;base64,${DATA.driverpic}`}
                                            alt="profile-image"
                                            width={150}
                                            className="p-1 text-center my-auto shadow cursor-pointer"
                                            onClick={() => setOpenModal(true)}
                                            />
                                        </SoftBox>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <SoftTypography variant="button" >Name: </SoftTypography>
                                        <SoftTypography variant="button" className="fw-normal"> {DATA.driver_name} </SoftTypography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <SoftTypography variant="button" >Email: </SoftTypography>
                                        <SoftTypography variant="button" className="fw-normal"> {DATA.driverid} </SoftTypography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <SoftTypography variant="button" >Contact: </SoftTypography>
                                        <SoftTypography variant="button" className="fw-normal"> {DATA.driver_contact} </SoftTypography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <SoftTypography variant="button" >Address: </SoftTypography>
                                        <SoftTypography variant="button" className="fw-normal"> {DATA.driver_address} </SoftTypography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <SoftTypography variant="button" >Plate Number: </SoftTypography>
                                        <SoftTypography variant="button" className="fw-normal"> {DATA.plate_number} </SoftTypography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <SoftTypography variant="button" >License Number: </SoftTypography>
                                        <SoftTypography variant="button" className="fw-normal"> {DATA.license_number} </SoftTypography>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid> 
                        <Grid mt={3} container spacing={0} alignItems="center" justifyContent="end">
                            <Grid item xs={12} sm={3} md={2} >
                                <SoftBox display="flex" justifyContent="end">
                                        <SoftButton onClick={handleCancel} className="mx-1 text-xxs px-3 rounded-pill" size="medium" color="light" iconOnly>
                                            <ReplyTwoToneIcon />
                                        </SoftButton>
                                        <SoftButton onClick={() => handleDelete(formData.id)} className="mx-1 text-xxs px-3 rounded-pill" size="medium" color="error" iconOnly>
                                        <DeleteTwoToneIcon /> 
                                        </SoftButton>
                                </SoftBox>
                            </Grid>
                        </Grid>     
                    </SoftBox>
                </SoftBox>
            </SoftBox>
            
        </SoftBox>
    </>
    );
}

export default Edit;
