import "@babel/polyfill";
import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route } from "react-router-dom";
import App from "App";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";

const theme = createMuiTheme({
    palette: {
        text: {
            primary: "rgba(255,255,255, 1)",
            secondary: "rgba(255,255,255, 0.9)",
            disabled: "rgba(255,255,255, 0.7)",
            hint: "rgba(255,255,255, 0.6)"
        },
        success: {
            light: "#8aec84",
            main: "#57b955",
            dark: "#1d8828",
            contrastText: "#fff"
        },
        info: {
            light: "#84f2ed",
            main: "#4ebfbb",
            dark: "#008e8b",
            contrastText: "#fff"
        },
        debug: {
            light: "#9e9e9e",
            main: "#707070",
            dark: "#454545",
            contrastText: "#fff"
        },
        warning: {
            light: "#ffe14c",
            main: "#f0af03",
            dark: "#b88000",
            contrastText: "#000"
        }
    },
    overrides: {
        MuiTableCell: {
            root: {
                borderBottom: 0
            }
        },
        MuiPaper: {
            root: {
                backgroundColor: "rgba(0,0,0,0.8)"
            }
        }
    }
});

ReactDOM.render(
    <MuiThemeProvider theme={theme}>
        <HashRouter>
            <Route path="/" component={App} />
        </HashRouter>
    </MuiThemeProvider>,
    document.getElementById("cupidon")
);
