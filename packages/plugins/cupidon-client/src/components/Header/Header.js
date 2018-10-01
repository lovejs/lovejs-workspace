import React from "react";
import PropTypes from "prop-types";
import { Menu } from "@material-ui/icons";
import { withStyles, AppBar, Toolbar, IconButton, Hidden, Button } from "@material-ui/core";
import cx from "classnames";

import {
    container,
    defaultFont,
    primaryColor,
    defaultBoxShadow,
    infoColor,
    successColor,
    warningColor,
    dangerColor
} from "variables/styles";

const headerStyle = theme => ({
    appBar: {
        top: "-30px",
        [theme.breakpoints.down("md")]: {
            top: "-15px"
        },
        backgroundColor: "transparent",
        boxShadow: "none",
        borderBottom: "0",
        marginBottom: "0",
        position: "absolute",
        width: "100%",
        paddingTop: "10px",
        zIndex: "1029",
        color: "#555555",
        border: "0",
        borderRadius: "3px",
        padding: "10px 0",
        transition: "all 150ms ease 0s",
        minHeight: "50px",
        display: "block"
    },
    container,
    appResponsive: {
        top: "8px"
    }
});

function Header({ ...props }) {
    const { classes, color } = props;
    const appBarClasses = cx({
        [" " + classes[color]]: color
    });
    return (
        <AppBar className={classes.appBar}>
            <Toolbar className={classes.container}>
                <Hidden mdUp>
                    <IconButton
                        className={classes.appResponsive}
                        color="inherit"
                        aria-label="open drawer"
                        onClick={props.handleDrawerToggle}
                    >
                        <Menu />
                    </IconButton>
                </Hidden>
            </Toolbar>
        </AppBar>
    );
}

Header.propTypes = {
    classes: PropTypes.object.isRequired,
    color: PropTypes.oneOf(["primary", "info", "success", "warning", "danger"])
};

export default withStyles(headerStyle)(Header);
