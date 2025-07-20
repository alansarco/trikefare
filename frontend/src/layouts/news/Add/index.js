// React components
import { Grid} from "@mui/material";
import FixedLoading from "components/General/FixedLoading";
import SoftBox from "components/SoftBox";
import SoftButton from "components/SoftButton";
import SoftTypography from "components/SoftTypography";
import { useState } from "react";
import { toast } from "react-toastify";
import { messages } from "components/General/Messages";
import { useStateContext } from "context/ContextProvider";
import { passToErrorLogs, passToSuccessLogs  } from "components/Api/Gateway";
import axios from "axios";
import { apiRoutes } from "components/Api/ApiRoutes";
import ReplyTwoToneIcon from '@mui/icons-material/ReplyTwoTone';
import ReactQuill from 'react-quill';

function Add({HandleRendering, ReloadTable }) {
    const currentFileName = "layouts/news/Add/index.js";
    const [submitProfile, setSubmitProfile] = useState(false);
    const {token} = useStateContext();  

    const YOUR_ACCESS_TOKEN = token; 
    const headers = {
        'Authorization': `Bearer ${YOUR_ACCESS_TOKEN}`
    };

    const initialState = {
        details: '',
  };

    const [formData, setFormData] = useState(initialState);

    const handleCancel = () => {
        HandleRendering(1);
        ReloadTable();
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        toast.dismiss();
        setSubmitProfile(true);
        try {
                if (!token) {
                    toast.error(messages.prohibit, { autoClose: true });
                }
                else {  
                    const response = await axios.post(apiRoutes.addNews, formData, {headers});
                    if(response.data.status == 200) {
                        toast.success(`${response.data.message}`, { autoClose: true });
                        HandleRendering(1);
                        ReloadTable();
                    } else {
                        toast.error(`${response.data.message}`, { autoClose: true });
                    }
                    passToSuccessLogs(response.data, currentFileName);
                }
        } catch (error) { 
                toast.error("Cannot add News!", { autoClose: true });
                passToErrorLogs(error, currentFileName);
        }     
        setSubmitProfile(false);
    };
        
    return (  
    <>
        {submitProfile && <FixedLoading />}   
        <SoftBox mt={5} mb={3} px={2}>      
            <SoftBox mb={5} p={4} className="shadow-sm rounded-4 bg-white">
                <SoftBox>
                    <SoftBox component="form" role="form" className="px-md-0 px-2" onSubmit={handleSubmit}>
                        <SoftTypography fontWeight="medium" textTransform="capitalize" color="error" textGradient>
                                News Fare Information    
                        </SoftTypography>
                        <Grid container spacing={0} alignItems="start">
                            <Grid item xs={12}>
                                <ReactQuill
                                    theme="snow"
                                    value={formData.details}
                                    onChange={(content) =>
                                        setFormData({ ...formData, details: content })
                                    }
                                    className="custom-editor bg-white border-0 border"
                                    style={{ minHeight: 150 }}
                                /> 
                            </Grid>  
                        </Grid> 
                        <Grid mt={3} container spacing={0} alignItems="center" justifyContent="end">
                            <Grid item xs={12} sm={3} md={2} >
                                <SoftBox display="flex" justifyContent="end">
                                        <SoftButton onClick={handleCancel} className="mx-1 text-xxs px-3 rounded-pill" size="medium" color="light" iconOnly>
                                            <ReplyTwoToneIcon />
                                        </SoftButton>
                                        <SoftButton variant="gradient" type="submit" className="mx-1 text-xxs px-3 rounded-pill" size="small" color="dark">
                                            save
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

export default Add;
