
function collapseItem(theme, ownerState) {
  const { palette, transitions, breakpoints, boxShadows, borders, functions } = theme;
  const { active, transparentSidenav } = ownerState;

  const { success, white, text, transparent, dark, light, transnav} = palette;
  const { xxl } = boxShadows;
  const { borderRadius } = borders;
  const { pxToRem } = functions;

  return {
    background: active && transparentSidenav ? white.main : transparent.main,
    color: active ? white.main : white.main,
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: `${pxToRem(10.8)} ${pxToRem(12.8)} ${pxToRem(10.8)} ${pxToRem(16)}`,
    margin: `0 ${pxToRem(16)}`,
    borderRadius: borderRadius.md,
    cursor: "pointer",
    textTransform: active && "uppercase",
    userSelect: "none",
    whiteSpace: "nowrap",
    boxShadow: active && transparentSidenav ? xxl : "none",
    [breakpoints.up("xl")]: {
      boxShadow: () => {
        if (active) {
          return transparentSidenav ? xxl : "none";
        }

        return "none";
      },
      transition: transitions.create("box-shadow", {
        easing: transitions.easing.easeInOut,
        duration: transitions.duration.shorter,
      }),
    },
  };
}

function collapseIconBox(theme, ownerState) {
  const { palette, transitions, breakpoints, boxShadows, borders, functions } = theme;
  const { active, transparentSidenav, color } = ownerState;

  const { white, info, light, gradients , dark,  transnav} = palette;
  const { md } = boxShadows;
  const { borderRadius } = borders;
  const { pxToRem } = functions;

  return {
    background: () => {
      if (active) {
        return color === "default" ? transnav.lightnav : transnav.main;
      }

      return light.main;
    },
    minWidth: pxToRem(32),
    minHeight: pxToRem(30),
    borderRadius: borderRadius.md,
    display: "grid",
    placeItems: "center",
    boxShadow: md,
    transition: transitions.create("margin", {
      easing: transitions.easing.easeInOut,
      duration: transitions.duration.standard,
    }),

    [breakpoints.up("xl")]: {
      background: () => {
        let background;

        if (!active) {
          background = transparentSidenav ? white.main : white.main;
        } else if (color === "default") {
          background = light.main;
        } else if (color === "success") {
          background = light.main;
        } else {
          background = transparentSidenav ? transnav.sidenav : transnav.sidenav; // icon background color
        }

        return background;
      },
    },

    "& svg, svg g": {
      fill: active ? white.main : transnav.sidenav,  // icon color
    },
  };
}

const collapseIcon = ({ palette: { white, gradients, transnav } }, { active }) => ({
  color: active ? transnav.sidenav : transnav.sidenav,
});

function collapseText(theme, ownerState) {
  const { typography, transitions, breakpoints, functions } = theme;
  const { miniSidenav, transparentSidenav, active } = ownerState;

  const { size, fontWeightMedium, fontWeightBold, fontWeightRegular } = typography;
  const { pxToRem } = functions;

  return {
    marginLeft: pxToRem(12.8),

    [breakpoints.up("xl")]: {
      opacity: miniSidenav || (miniSidenav && transparentSidenav) ? 0 : 1,
      maxWidth: miniSidenav || (miniSidenav && transparentSidenav) ? 0 : "100%",
      marginLeft: miniSidenav || (miniSidenav && transparentSidenav) ? 0 : pxToRem(12.8),
      transition: transitions.create(["opacity", "margin"], {
        easing: transitions.easing.easeInOut,
        duration: transitions.duration.standard,
      }),
    },

    "& span": {
      fontWeight: active ? fontWeightBold : fontWeightRegular,
      fontSize: size.sm,
      lineHeight: 0,
    },
  };
}

export { collapseItem, collapseIconBox, collapseIcon, collapseText };
