// React components
import { Checkbox, Grid} from "@mui/material";
import FixedLoading from "components/General/FixedLoading";
import SoftBox from "components/SoftBox";
import SoftButton from "components/SoftButton";
import SoftInput from "components/SoftInput";
import SoftTypography from "components/SoftTypography";
import { accessSelect, years, genderSelect, currentDate } from "components/General/Utils";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { messages } from "components/General/Messages";
import { useStateContext } from "context/ContextProvider";
import { passToErrorLogs, passToSuccessLogs  } from "components/Api/Gateway";
import axios from "axios";
import { apiRoutes } from "components/Api/ApiRoutes";
import ReplyTwoToneIcon from '@mui/icons-material/ReplyTwoTone';

function Add({HandleRendering, ReloadTable }) {
      const currentFileName = "layouts/users/components/Add/index.js";
      const [submitProfile, setSubmitProfile] = useState(false);
      const {token} = useStateContext();  

      const YOUR_ACCESS_TOKEN = token; 
      const headers = {
            'Authorization': `Bearer ${YOUR_ACCESS_TOKEN}`
      };
      
      const initialState = {
            username: '',
            first_name: '',
            middle_name: "",
            last_name: "",
            id_picture: null,
            gender: '',
            address: '',
            access_level: 999,
            contact: '',
            birthdate: '',
            agreement: false,   
      };

      const [formData, setFormData] = useState(initialState);

      const handleChange = (e) => {
            const { name, value, type, files } = e.target;
    
            if (type === "checkbox") {
                setFormData({ ...formData, [name]: !formData[name] });
            } 
            else if (type === "file" && name === "id_picture") {
                const file = files[0];
                if (file && (file.type === "application/png" || file.name.endsWith(".png"))) {
                    setFormData({ ...formData, id_picture: file });
                } else {
                    toast.error("Only .png images are allowed");
                    e.target.value = null;
                }
            } 
            else {
                  setFormData({ ...formData, [name]: value });
            }
      };

      const handleCancel = () => {
            HandleRendering(1);
      };
            
      const handleSubmit = async (e) => {
            e.preventDefault(); 
            toast.dismiss();
             // Check if all required fields are empty
             const requiredFields = [
                 "username", 
                  "first_name", 
                  "last_name",
                  "id_picture",
                  "address",
                  "gender",
                  "access_level",
                  "contact",
                  "birthdate",
            ];
            console.log(formData);

            const emptyRequiredFields = requiredFields.filter(field => !formData[field]);
            if (emptyRequiredFields.length === 0) {
                  if(!formData.agreement) {
                        toast.warning(messages.agreement, { autoClose: true });
                  }
                  else {      
                        setSubmitProfile(true);
                        try {
                              if (!token) {
                                    toast.error(messages.prohibit, { autoClose: true });
                              }
                              else {  
                                    const data = new FormData();
                                    data.append("username", formData.username);
                                    data.append("password", formData.password);
                                    data.append("first_name", formData.first_name);
                                    data.append("middle_name", formData.middle_name);
                                    data.append("last_name", formData.last_name);
                                    data.append("id_picture", formData.id_picture);
                                    data.append("gender", formData.gender);
                                    data.append("contact", formData.contact);
                                    data.append("birthdate", formData.birthdate);
                                    data.append("address", formData.address);
                                    data.append("access_level", formData.access_level);
                                    const response = await axios.post(apiRoutes.accountStore, data, {headers});
                                    if(response.data.status == 200) {
                                          toast.success(`${response.data.message}`, { autoClose: true });
                                          setFormData(initialState);
                                          ReloadTable();
                                    } else {
                                          toast.error(`${response.data.message}`, { autoClose: true });
                                    }
                                    passToSuccessLogs(response.data, currentFileName);
                              }
                        } catch (error) { 
                              toast.error("Error adding Resident!", { autoClose: true });
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
                                          Account Information    
                                    </SoftTypography>
                                    <Grid container spacing={0} alignItems="center">
                                          <Grid item xs={12} sm={6} md={4} px={1}>
                                                <SoftTypography variant="button" className="me-1">Email:</SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                                <SoftInput  className="border"  name="username" type="email" value={formData.username} onChange={handleChange} size="small"/> 
                                          </Grid> 
                                          <Grid item xs={12} sm={6} md={4} px={1}>
                                                <SoftTypography variant="button" className="me-1">Password:</SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                                <SoftInput  className="border"  name="password" value={formData.password} onChange={handleChange} size="small" /> 
                                          </Grid>  
                                    </Grid>    
                                    <SoftTypography fontWeight="medium" textTransform="capitalize" color="error" textGradient>
                                          Personal Information    
                                    </SoftTypography>
                                    <input type="hidden" name="username" value={formData.username} size="small" /> 
                                    <Grid container spacing={0} alignItems="center">
                                          <Grid item xs={12} sm={6} md={3} px={1}>
                                                <SoftTypography variant="button" className="me-1">Firstname:</SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                                <SoftInput  className="border"  name="first_name" value={formData.first_name.toUpperCase()} onChange={handleChange} size="small" /> 
                                          </Grid>     
                                          <Grid item xs={12} sm={6} md={3} px={1}>
                                                <SoftTypography variant="button" className="me-1">Middle Name:</SoftTypography>
                                                <SoftInput  className="border"  name="middle_name" value={formData.middle_name.toUpperCase()} onChange={handleChange} size="small" /> 
                                          </Grid>     
                                          <Grid item xs={12} sm={6} md={3} px={1}>
                                                <SoftTypography variant="button" className="me-1">Last Name:</SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                                <SoftInput  className="border"  name="last_name" value={formData.last_name.toUpperCase()} onChange={handleChange} size="small" /> 
                                          </Grid>        
                                          <Grid item xs={12} sm={6} lg={2} px={1}>
                                                <SoftTypography variant="button" className="me-1"> Gender: </SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                                <select className="form-control form-select form-select-sm text-secondary rounded-5 cursor-pointer border" name="gender" value={formData.gender} onChange={handleChange} >
                                                      <option value=""></option>
                                                      {genderSelect && genderSelect.map((gender) => (
                                                      <option key={gender.value} value={gender.value}>
                                                            {gender.desc}
                                                      </option>
                                                      ))}
                                                </select>
                                          </Grid>
                                          <Grid item xs={12} sm={6} md={3} px={1}>
                                                <SoftTypography variant="button" className="me-1"> Contact Number: </SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                                <SoftInput  className="border"  type="number" name="contact" value={formData.contact} onChange={handleChange} size="small" /> 
                                          </Grid> 
                                          <Grid item xs={12} sm={6} md={3} px={1}>
                                                <SoftTypography variant="button" className="me-1"> Birthdate: </SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                                <input className="form-control form-control-sm text-secondary rounded-5 border"  max={currentDate} name="birthdate" value={formData.birthdate} onChange={handleChange} type="date" />
                                          </Grid>
                                          <Grid item xs={12} sm={6} md={4} px={1}>
                                                <SoftTypography variant="button" className="me-1"> Complete Address: </SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                                <SoftInput  className="border"  name="address" value={formData.address} onChange={handleChange} size="small" /> 
                                          </Grid>
                                          <Grid item xs={12} md={8} lg={4}px={1}>
                                                <SoftTypography variant="button" className="me-1">ID Picture:</SoftTypography>
                                                <SoftTypography variant="span" className="text-xxs text-danger fst-italic">*</SoftTypography>
                                                <input
                                                      type="file"
                                                      name="id_picture"
                                                      accept="image/*"
                                                      className="form-control form-control-sm rounded-5 text-xs border"
                                                      onChange={handleChange}
                                                />
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
