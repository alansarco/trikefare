// @mui material components
import Drawer from "@mui/material/Drawer";
import { styled } from "@mui/material/styles";

export default styled(Drawer)(({ theme, ownerState }) => {
  const { palette, boxShadows, transitions, breakpoints, functions } = theme;
  const { transparentSidenav, miniSidenav } = ownerState;

  const sidebarWidth = 255;
  const { white, transparent, background, transnav } = palette;
  const { xxl } = boxShadows;
  const { pxToRem } = functions;

  // styles for the sidenav when miniSidenav={false}
  const drawerOpenStyles = () => ({
    transform: `translateX(${pxToRem(-320)})`,
    transform: "translateX(0)",
    // transition: transitions.create("transform", {
    //   easing: transitions.easing.sharp,
    //   duration: transitions.duration.shorter,
    // }),
    margin: 0,
    borderRadius: 0,
    height: "100%",
    // height: "100vh",
      backgroundColor: transparentSidenav ? transnav.lightnav : transnav.lightnav,

    [breakpoints.up("xl")]: {
      backgroundColor: transparentSidenav ? transnav.lightnav : transnav.lightnav,
      boxShadow: transparentSidenav ? "none" : "none",
      marginBottom: transparentSidenav ? 0 : "inherit",
      left: "0",
      width: sidebarWidth,
      transform: "translateX(0)",
      transition: transitions.create(["width", "background-color"], {
        easing: transitions.easing.sharp,
        duration: transitions.duration.enteringScreen,
      }),
    },
  });

  // styles for the sidenav when miniSidenav={true}
  const drawerCloseStyles = () => ({
    transform: `translateX(${pxToRem(-320)})`,
    // transition: transitions.create("transform", {
    //   easing: transitions.easing.sharp,
    //   duration: transitions.duration.shorter,
    // }),
    margin: 0,
    borderRadius: 0,
    height: "100%",
    // height: "100vh",  
    
    [breakpoints.up("xl")]: {
      backgroundColor: transparentSidenav ? transnav.lightnav : transnav.lightnav,
      boxShadow: transparentSidenav ? "none" : xxl,
      marginBottom: transparentSidenav ? 0 : "inherit",
      left: "0",
      width: pxToRem(96),
      overflowX: "hidden",
      transform: "translateX(0)",
      transition: transitions.create(["width", "background-color"], {
        easing: transitions.easing.sharp,
        duration: transitions.duration.shorter,
      }),
    },
  });

  return {
    "& .MuiDrawer-paper": {
      boxShadow: xxl,
      border: "none",
      marginBottom: 0,
      ...(miniSidenav ? drawerCloseStyles() : drawerOpenStyles()),

      /* Firefox */
        scrollbarColor: "#ffe5e5 #c70000ff",
        scrollbarWidth: "thin",
      },
  };
});
