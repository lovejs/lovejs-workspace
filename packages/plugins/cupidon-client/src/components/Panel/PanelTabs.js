import React from "react";

import { withStyles } from "@material-ui/core/styles";

import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";

const styles = theme => ({
    tabs: {
        padding: "3px 0",
        overflow: "visible"
    },
    scroller: {
        overflowX: "visible"
    },
    tab: {
        color: "#FFF",
        backgroundColor: "rgba(51,51,51,0.425)",
        marginRight: 3,
        flexGrow: 0,
        flexShrink: 0,
        minWidth: 0,
        textTransform: "none",
        opacity: 1
    },
    indicator: {
        height: 3,
        backgroundColor: "rgba(51,51,51,0.425)",
        bottom: -3
    }
});

function PanelTabs({ classes, tabs, ...props }) {
    return (
        <Tabs classes={{ root: classes.tabs, indicator: classes.indicator, scroller: classes.scroller }} scrollable={false} {...props}>
            {tabs.map(tab => <Tab key={tab} className={classes.tab} label={tab} />)}
        </Tabs>
    );
}

export default withStyles(styles)(PanelTabs);
