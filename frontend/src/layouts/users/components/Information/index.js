// @mui material components
import Grid from "@mui/material/Grid";

// React components
import SoftBox from "components/SoftBox";
import SoftButton from "components/SoftButton";
import { toast } from "react-toastify";
// import Swal from "assets/sweetalert/sweetalert.min.js";

// React examples
import ProfileInfoCard from "essentials/Cards/InfoCards/ProfileInfoCard";
import { useStateContext } from "context/ContextProvider";
import { passToSuccessLogs, passToErrorLogs } from "components/Api/Gateway";
import { apiRoutes } from "components/Api/ApiRoutes";
import { useState } from "react";
import FixedLoading from "components/General/FixedLoading"; 
import { messages } from "components/General/Messages";
import axios from "axios";  
import ReplyTwoToneIcon from '@mui/icons-material/ReplyTwoTone';

function Information({USER, HandleRendering, ReloadTable, allowDelete}) {
  const [deleteUser, setDeleteUser] = useState(false);
  const currentFileName = "layouts/users/components/UserContainer/index.js";

  const username = USER.username;
  const {token, role, access, user} = useStateContext();  
  const YOUR_ACCESS_TOKEN = token; 
  const headers = {
    'Authorization': `Bearer ${YOUR_ACCESS_TOKEN}`
  };

  const handleCancel = () => {
    HandleRendering(1);
    ReloadTable();
  };

  const handleDelete = async (e) => {
    e.preventDefault();     
    Swal.fire({
      customClass: {
        title: 'alert-title',
        icon: 'alert-icon',
        confirmButton: 'alert-confirmButton',
        cancelButton: 'alert-cancelButton',
        container: 'alert-container',
        popup: 'alert-popup'
      },
      title: 'Delete Account?',
      text: "Are you sure you want to delete this data? You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',  
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setDeleteUser(true);
          if (!token) {
            toast.error(messages.prohibit, { autoClose: true });
          }
          else {  
            axios.get(apiRoutes.accountDelete, { params: { username }, headers })
              .then(response => {
                if (response.data.status == 200) {
                  toast.success(`${response.data.message}`, { autoClose: true });
                } else {
                  toast.error(`${response.data.message}`, { autoClose: true });
                }
                passToSuccessLogs(response.data, currentFileName);
                HandleRendering(1);
                ReloadTable();
                setDeleteUser(false);
              })  
              .catch(error => {
                setDeleteUser(false);
                toast.error("Cant delete user", { autoClose: true });
                passToErrorLogs(error, currentFileName);
              });
          }
      }
    })
  };


  return (
    <>  
      {deleteUser && <FixedLoading /> }
      <SoftBox mt={5} mb={3} px={2}>
        <SoftBox p={4} className="shadow-sm rounded-4 bg-white" >
          <Grid container spacing={2}>
            <Grid item xs={12} md={6} xl={6}>
              <ProfileInfoCard
                title="Personal Information"
                info={{
                  Firstname: USER.first_name,
                  Middle_Name: USER.middle_name,
                  Lastname: USER.last_name,
                  Gender: USER.gender == null ? " " : USER.gender,
                  Birthdate: USER.birthday == null ? " " : USER.birthday,
                  Contact_Number: USER.contact == null ? " " : USER.contact,
                  Address: USER.address == null ? " " : USER.address,
                  Status: USER.status == "1" ? "Active" : "Inactive",
                  ID_Number: USER.id_number == null ? " " : USER.id_number,
                  Type: USER.access_level == null ? " " : USER.access_level == 10 ? "Driver" : "Commuter",
                  Last_Online: USER.last_online,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6} xl={6}>
              <ProfileInfoCard
                  title="Other Information"
                  info={{
                  Updated_Date: USER.created_date == null ? " " : USER.created_date,
                  Updated_By: USER.updated_by == null ? " " : USER.updated_by,
                  Created_Date: USER.created_date == null ? " " : USER.created_date,
                  Created_by: USER.created_by == null ? " " : USER.created_by,
                  }}
              />
            </Grid>
          </Grid>
          <Grid mt={3} container spacing={0} alignItems="center" justifyContent="end">
            <Grid item xs={12} sm={4} md={2} pl={1}>
              <SoftBox mt={2} display="flex" justifyContent="end">
                <SoftButton onClick={handleCancel} className="mx-1 text-xxs px-3 rounded-pill" size="medium" color="light" iconOnly>
                  <ReplyTwoToneIcon />
                </SoftButton>
                {allowDelete && user != username &&
                <SoftButton onClick={handleDelete} variant="gradient" color="error" className="mx-2 w-100 text-xxs px-3 rounded-pill" size="small">
                  Delete
                </SoftButton>}
              </SoftBox>
            </Grid>
          </Grid>   
        </SoftBox>
      </SoftBox>
    </>
  );
}

export default Information;
