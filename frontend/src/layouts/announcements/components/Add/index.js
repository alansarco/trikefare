// React components
import { Checkbox, Grid} from "@mui/material";
import FixedLoading from "components/General/FixedLoading";
import SoftBox from "components/SoftBox";
import SoftButton from "components/SoftButton";
import SoftInput from "components/SoftInput";
import SoftTypography from "components/SoftTypography";
import { colorSelect, currentDate } from "components/General/Utils";
import { useState } from "react";
import { toast } from "react-toastify";
import { messages } from "components/General/Messages";
import { useStateContext } from "context/ContextProvider";
import { passToErrorLogs, passToSuccessLogs  } from "components/Api/Gateway";
import axios from "axios";
import { apiRoutes } from "components/Api/ApiRoutes";
import ReactQuill from 'react-quill';
import ReplyTwoToneIcon from '@mui/icons-material/ReplyTwoTone';

function Add({HandleRendering, ReloadTable}) {
      const currentFileName = "layouts/announcements/components/Add/index.js";
      const [submitProfile, setSubmitProfile] = useState(false);
      const {token} = useStateContext();  

      const YOUR_ACCESS_TOKEN = token; 
      const headers = {
            'Authorization': `Bearer ${YOUR_ACCESS_TOKEN}`
      };
        
      const initialState = {
            event_name: "",
            description: "",
            details: "",
            event_date: "",
            event_date_end: "",
            color: "",
            agreement: false,   
      };

      const [formData, setFormData] = useState(initialState);

      const handleChange = (e) => {
            const { name, value, type } = e.target;
            if (type === "checkbox") {
                  setFormData({ ...formData, [name]: !formData[name]});
            } else {
                  setFormData({ ...formData, [name]: value });
            }
      };

      const handleCancel = () => {
            HandleRendering(1);
            ReloadTable();
      };
            
      const handleSubmit = async (e) => {
            e.preventDefault(); 
            toast.dismiss();
            // Check if all required fields are empty
            const requiredFields = [
                  "event_name",
                  "description",
                  "event_date",
                  "event_date_end",
                  "color",
            ];
            const emptyRequiredFields = requiredFields.filter(field => !formData[field]);

            // Check if event_date_end is less than event_date
            const eventDate = new Date(formData.event_date);
            const eventDateEnd = new Date(formData.event_date_end);

            if (emptyRequiredFields.length === 0) {
                  if(!formData.agreement) {
                        toast.warning(messages.agreement, { autoClose: true });
                    }
                    else if (eventDateEnd < eventDate) {
                        toast.warning("End date cannot be before the start date!", { autoClose: true });
                    }
                  else {      
                        setSubmitProfile(true);
                        try {
                              if (!token) {
                                    toast.error(messages.prohibit, { autoClose: true });
                              }
                              else {  
                                    const response = await axios.post(apiRoutes.addAnnouncement, formData, {headers});
                                    if(response.data.status == 200) {
                                          toast.success(`${response.data.message}`, { autoClose: true });
                                          setFormData(initialState);
                                    } else {
                                          toast.error(`${response.data.message}`, { autoClose: true });
                                    }
                                    passToSuccessLogs(response.data, currentFileName);
                              }
                        } catch (error) { 
                              toast.error(messages.addUserError, { autoClose: true });
                              passToErrorLogs(error, currentFileName);
                        }     
                        setSubmitProfile(false);
                  }
                  
            } else {
                  // Display an error message or prevent form submission
                  toast.warning(messages.required, { autoClose: true });
            }
      };

      return (  
      <>
            {submitProfile && <FixedLoading />}   
            <SoftBox mt={5} mb={3} px={2}>      
                  <SoftBox mb={5} p={4} className="shadow-sm rounded-4 bg-white">
                        <SoftBox>
                              <SoftBox component="form" role="form" className="px-md-0 px-2" onSubmit={handleSubmit}>
                                    <SoftTypography fontWeight="medium" textTransform="capitalize" color="error" textGradient>
                                          Announcement Information    
                                    </SoftTypography>
                                    <Grid container spacing={0} alignItems="center">
                                          <Grid item xs={12} sm={6} md={4} lg={3} px={1}>
                                                <SoftTypography variant="button" className="me-1">Title:</SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                                <SoftInput className="border" name="event_name" value={formData.event_name.toUpperCase()} onChange={handleChange} size="small" /> 
                                          </Grid>  
                                          <Grid item xs={12} md={8} lg={5} px={1}>
                                                <SoftTypography variant="button" className="me-1">Description:</SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                                <SoftInput className="border" name="description" value={formData.description} onChange={handleChange} size="small" />
                                          </Grid>  
                                    </Grid> 
                                    <SoftTypography mt={2} fontWeight="medium" textTransform="capitalize" color="error" textGradient>
                                          Other Information    
                                    </SoftTypography>
                                    <Grid container spacing={0} alignItems="center">
                                          <Grid item xs={12} px={1}>
                                                <SoftTypography variant="button" className="me-1">Details:</SoftTypography>
                                                <ReactQuill
                                                      theme="snow"
                                                      value={formData.details}
                                                      onChange={(content) =>
                                                            setFormData({ ...formData, details: content })
                                                      }
                                                      className="custom-editor bg-white rounded-2"
                                                      style={{ minHeight: 150 }}
                                                /> 
                                          </Grid>  
                                          <Grid item xs={12} sm={6} md={4} lg={3} px={1}>
                                                <SoftTypography variant="button" className="me-1"> Start Date: </SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                                <input className="form-control form-control-sm text-secondary rounded-5 border"  min={currentDate} name="event_date" value={formData.event_date} onChange={handleChange} type="date" />
                                          </Grid>          
                                          <Grid item xs={12} sm={6} md={4} lg={3} px={1}>
                                                <SoftTypography variant="button" className="me-1"> End Date: </SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                                <input className="form-control form-control-sm text-secondary rounded-5 border"  min={currentDate} name="event_date_end" value={formData.event_date_end} onChange={handleChange} type="date" />
                                          </Grid>                          
                                          <Grid item xs={12} sm={6} md={4} lg={2} px={1}>
                                                <SoftTypography variant="button" className="me-1"> Color: </SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                                <select className="form-control form-select form-select-sm text-secondary rounded-5 cursor-pointer border" name="color" value={formData.color} onChange={handleChange} >
                                                      <option value=""></option>
                                                      {colorSelect && colorSelect.map((color) => (
                                                      <option key={color.value} value={color.value}>
                                                            {color.desc}
                                                      </option>
                                                      ))}
                                                </select>
                                          </Grid>
                                    </Grid> 
                                    <Grid mt={3} container spacing={0} alignItems="center">
                                          <Grid item xs={12} pl={1}>
                                                <Checkbox 
                                                      className={` ${formData.agreement ? '' : 'border-2 border-danger'}`} 
                                                      name="agreement" 
                                                      checked={formData.agreement} 
                                                      onChange={handleChange} 
                                                />
                                                <SoftTypography variant="button" className="me-1 ms-2">Verify Data </SoftTypography>
                                                <SoftTypography variant="p" className="text-xxs text-secondary fst-italic">(Confirming that the information above are true and accurate) </SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                          </Grid>
                                    </Grid>
                                    <Grid mt={3} container spacing={0} alignItems="center" justifyContent="end">
                                          <Grid item xs={12} sm={4} md={2} pl={1}>
                                                <SoftBox mt={2} display="flex" justifyContent="end">
                                                      <SoftButton onClick={handleCancel} className="mx-1 text-xxs px-3 rounded-pill" size="medium" color="light" iconOnly>
                                                            <ReplyTwoToneIcon />
                                                      </SoftButton>
                                                      <SoftButton variant="gradient" type="submit" className="mx-2 w-100 text-xxs px-3 rounded-pill" size="small" color="dark">
                                                            Save
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
