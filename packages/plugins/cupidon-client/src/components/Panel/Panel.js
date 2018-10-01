import React from "react";

import { withStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";

const styles = theme => ({
    container: {
        marginBottom: 40,
        padding: "12px 17px",
        background: "rgba(51,51,51,0.425)",
        color: "#d2d2d2",
        boxShadow: "none",
        borderRadius: 3
    },
    title: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "bold"
    }
});

function Panel({ color, title, subtitle, classes, children, ...props }) {
    return (
        <Paper elevation={2} className={classes.container}>
            <Typography variant="title" className={classes.title}>
                {title}
            </Typography>
            <div className={classes.content}>{children}</div>
        </Paper>
    );
}

export default withStyles(styles)(Panel);
