import React from "react";

import TextField from "@material-ui/core/TextField";
import { withStyles } from "@material-ui/core/styles";

const styles = theme => ({
    input: {
        borderBottom: "1px solid #FFF",
        color: "#FFF"
    },
    inputFocused: {
        "&:after": {
            borderBottom: 0
        }
    },
    cssLabel: {
        fontSize: 14,
        "&$cssFocused": {
            color: "#FFF"
        }
    },
    cssFocused: {},
    cssUnderline: {
        "&:after": {
            borderBottomColor: "#FFF"
        }
    }
});

function PanelInput({ classes, ...props }) {
    const inputProps = {
        classes: { root: classes.input, focused: classes.inputFocused }
    };
    const inputLabelProps = {
        FormLabelClasses: {
            root: classes.cssLabel,
            focused: classes.cssFocused
        }
    };

    return <TextField InputProps={inputProps} InputLabelProps={inputLabelProps} {...props} />;
}

export default withStyles(styles)(PanelInput);
