//local
export const mainRoute = "http://127.0.0.1:8000";
//without portal 
// export const mainRoute = "https://trikefare.com";
//without portal
// export const mainRoute = "https://trikefare.com/server/public";

export const apiRoutes = {  
    login: `${mainRoute}/api/login`,
    signupuser: `${mainRoute}/api/signupuser`,
    createOTP: `${mainRoute}/api/createotp`,
    createOTPverification: `${mainRoute}/api/createotpverification`,
    validateOTP: `${mainRoute}/api/validateotp`,
    submitPassword: `${mainRoute}/api/submitpassword`,

    app_infoRetrieve: `${mainRoute}/api/app_info`,

    authUserRetrieve: `${mainRoute}/api/user`,
    doLogout: `${mainRoute}/api/user`,
    
    adminRetrieve: `${mainRoute}/api/admins`,

    retrieveAnnouncement: `${mainRoute}/api/announcements`,
    retrieveAnnouncementOne: `${mainRoute}/api/announcements/retrieve`,
    addAnnouncement: `${mainRoute}/api/announcements/addannouncement`,
    deleteAnnouncement: `${mainRoute}/api/announcements/deleteannouncement`,
    updateAnnouncement: `${mainRoute}/api/announcements/updateannouncement`,

    retrieveReport: `${mainRoute}/api/reports`,
    retrieveReportOne: `${mainRoute}/api/reports/retrieve`,
    deleteReport: `${mainRoute}/api/reports/deletereport`,
    reopenReport: `${mainRoute}/api/reports/reopenreport`,
    updateReport: `${mainRoute}/api/reports/updatereport`,

    retrieveFeedback: `${mainRoute}/api/feedbacks`,
    retrieveFeedbackOne: `${mainRoute}/api/feedbacks/retrieve`,
    deleteFeedback: `${mainRoute}/api/feedbacks/deletefeedback`,
    
    retrieveNews: `${mainRoute}/api/newsfares`,
    retrieveNewsOne: `${mainRoute}/api/newsfares/retrieve`,
    deleteNews: `${mainRoute}/api/newsfares/deletenews`,
    updateNews: `${mainRoute}/api/newsfares/updatenews`,
    addNews: `${mainRoute}/api/newsfares/addnews`,

    usersRetrieve: `${mainRoute}/api/accounts`,
    accountRetrieveOne: `${mainRoute}/api/accounts/retrieve`,
    accountStore: `${mainRoute}/api/accounts/store`,
    accountDelete: `${mainRoute}/api/accounts/delete`,
    accountUpdate: `${mainRoute}/api/accounts/update`,
    personalChangePass: `${mainRoute}/api/accounts/personalchangepass`,


    otherStatsRetrieve: `${mainRoute}/api/dashboard/otherStats`,
    pollsRetrieve: `${mainRoute}/api/dashboard/polls`,

    retrieveSettings: `${mainRoute}/api/settings`,
    updateSettings: `${mainRoute}/api/settings/updatesettings`,

    
    // Add more routes here
};  