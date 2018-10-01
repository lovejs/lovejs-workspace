import React from "react";
import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import cx from "classnames";
import { withStyles } from "@material-ui/core/styles";
import { Drawer, Button, Hidden, List, ListItem, ListItemIcon, ListItemText } from "@material-ui/core";

import { drawerWidth, transition, boxShadow, defaultFont } from "variables/styles";

const styles = theme => ({
    drawerPaper: {
        backgroundColor: "transparent",
        border: "none",
        position: "fixed",
        top: "0",
        bottom: "0",
        left: "0",
        zIndex: "1",
        // overflow: 'auto',
        ...boxShadow,
        width: drawerWidth,
        [theme.breakpoints.up("md")]: {
            width: drawerWidth,
            position: "fixed",
            height: "100%"
        },
        [theme.breakpoints.down("sm")]: {
            width: drawerWidth,
            ...boxShadow,
            position: "fixed",
            display: "block",
            top: "0",
            height: "100vh",
            right: "0",
            left: "auto",
            zIndex: "1032",
            visibility: "visible",
            overflowY: "visible",
            borderTop: "none",
            textAlign: "left",
            paddingRight: "0px",
            paddingLeft: "0",
            transform: `translate3d(${drawerWidth}px, 0, 0)`,
            ...transition
        }
    },
    logo: {
        ...defaultFont,
        padding: "5px 0",
        marginTop: 20,
        display: "block",
        fontSize: "18px",
        textAlign: "left",
        fontWeight: "normal",
        lineHeight: "30px",
        textDecoration: "none",
        textAlign: "center",
        color: "#FFF",
        "& span": { fontSize: 13 }
    },
    list: {
        padding: "12px 20px",
        flex: 1
    },
    item: {
        ...defaultFont,
        color: "#FFF",
        fontSize: 13,
        fontWeight: 600,
        textDecoration: "none",
        display: "flex",
        textDecoration: "none",
        padding: "4px 12px",
        borderRadius: "3px",
        textTransform: "capitalize",
        "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.08)"
        },
        "& svg": {
            fill: "#EEE",
            width: 16,
            height: 16
        },
        "& span": {
            marginRight: 0
        }
    }
});

const Sidebar = ({ ...props }) => {
    // verifies if routeName is the one active (in browser input)
    function activeRoute(routeName) {
        return props.location.pathname.indexOf(routeName) > -1 ? true : false;
    }
    const { classes, color, routes } = props;

    var links = (
        <div className={classes.list}>
            {routes.map((prop, key) => {
                if (prop.redirect) return null;
                const listItemClasses = cx({
                    [" " + classes[color]]: activeRoute(prop.path)
                });
                const whiteFontClasses = cx({
                    [" " + classes.whiteFont]: activeRoute(prop.path)
                });

                return (
                    <NavLink to={prop.path} className={classes.item} activeClassName="active" key={key}>
                        <ListItemIcon
                            children={
                                typeof prop.icon == "string" ? <span dangerouslySetInnerHTML={{ __html: prop.icon }} /> : <prop.icon />
                            }
                        />
                        <ListItemText primary={prop.sidebarName} disableTypography={true} />
                    </NavLink>
                );
            })}
        </div>
    );
    var brand = (
        <a href="#" className={classes.logo}>
            Love <strong>JS</strong> <span id="lovejs-version" />
        </a>
    );
    return (
        <div>
            <Hidden mdUp>
                <Drawer
                    variant="temporary"
                    anchor="right"
                    open={props.open}
                    classes={{
                        paper: classes.drawerPaper
                    }}
                    onClose={props.handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true // Better open performance on mobile.
                    }}
                >
                    {brand}
                    {links}
                    <div id="memory-usage" />
                </Drawer>
            </Hidden>
            <Hidden smDown>
                <Drawer
                    anchor="left"
                    variant="permanent"
                    open
                    classes={{
                        paper: classes.drawerPaper
                    }}
                >
                    {brand}
                    {links}
                    <div id="memory-usage" />
                </Drawer>
            </Hidden>
        </div>
    );
};

Sidebar.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Sidebar);
