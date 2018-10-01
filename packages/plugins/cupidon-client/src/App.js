/* https://demo.flatlogic.com/4.0.1/dark/# */
import React from "react";
import PropTypes from "prop-types";
import { Switch, Route, Redirect } from "react-router-dom";
import axios from "axios";
import Websocket from "react-websocket";

import { withStyles } from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";

import { Header, Sidebar } from "components";

import { drawerWidth, transition, container, defaultFont } from "variables/styles.jsx";
import background from "assets/img/bg-pattern.svg";

import routes from "./routes";
import Emitter from "./emitter";

const ws = `ws${window.location.protocol.substr(-2, 1) == "s" ? "s" : ""}://${window.location.host}/__cupidon`;
const api = extension => async (query, params = {}) => axios.get(`query`, { params: { ext: extension, query, ...params } });

const styles = theme => ({
    "@global body": {
        backgroundImage: `url(${background}), radial-gradient(farthest-side ellipse at 10% 0, #60415a 20%, #b194ac)`, //linear-gradient(45deg, #874da2 0%, #c43a30 100%);`, // #d82b2b 0%, #75817d 19%, #1e90ac 42%, #6a44b0 79%, #3191a9 100%)`, //linear-gradient(to right, #C06C84, #6C5B7B, #355C7D)`,
        backgroundSize: "cover",
        backgroundAttachment: "fixed, fixed"
    },
    "@global a": {
        color: "#FFF",
        fontWeight: "bold"
    },
    "@global tbody tr:nth-child(odd)": {
        backgroundColor: "rgba(51,51,51,0.3)"
    },
    wrapper: {
        position: "relative",
        top: "0",
        height: "100vh"
    },
    title: {
        ...defaultFont,
        flex: 1,
        color: "#fff",
        fontWeight: "300",
        lineHeight: "1",
        fontSize: 28,
        textTransform: "capitalize",
        paddingLeft: 15
    },
    mainPanel: {
        [theme.breakpoints.up("md")]: {
            width: `calc(100% - ${drawerWidth}px)`
        },
        overflow: "auto",
        position: "relative",
        float: "right",
        ...transition,
        maxHeight: "100%",
        width: "100%",
        overflowScrolling: "touch"
    },
    content: {
        marginTop: "35px",
        padding: "15px 30px",
        minHeight: "calc(100% - 123px)"
    },
    container
});

class App extends React.Component {
    constructor() {
        super();
        this.extensions = {};
        this.emitters = {};
    }

    state = {
        mobileOpen: false
    };

    handleDrawerToggle = () => {
        this.setState({ mobileOpen: !this.state.mobileOpen });
    };

    componentDidUpdate() {
        this.refs.mainPanel.scrollTop = 0;
    }

    getEmitter = ext => {
        if (!this.emitters[ext]) {
            this.emitters[ext] = new Emitter();
        }

        return this.emitters[ext];
    };

    handleMessage = message => {
        try {
            const { ext, data } = JSON.parse(message);
            const emitter = this.getEmitter(ext);
            if (emitter) {
                emitter.emit(data);
            }
        } catch (e) {
            console.error("Error parsing message : ", message);
        }
    };

    switcher() {
        return (
            <Switch>
                {routes.map((prop, key) => {
                    const Component = prop.component;
                    const ref = "ext_" + prop.ext;
                    if (prop.redirect) return <Redirect from={prop.path} to={prop.to} key={key} />;

                    return (
                        <Route
                            path={prop.path}
                            component={() => (
                                <Component
                                    api={api(prop.ext)}
                                    emitter={this.getEmitter(prop.ext)}
                                    ref={instance => (this.extensions[ref] = instance)}
                                />
                            )}
                            key={key}
                        />
                    );
                })}
            </Switch>
        );
    }

    render() {
        const { classes, ...rest } = this.props;
        const matchRoute = routes.filter(r => r.path == this.props.location.pathname)[0];
        const title = matchRoute ? matchRoute.navbarName : "Love Js";

        return (
            <div className={classes.wrapper}>
                <CssBaseline />
                <Websocket url={ws} onMessage={message => this.handleMessage(message)} />
                <Sidebar routes={routes} handleDrawerToggle={this.handleDrawerToggle} open={this.state.mobileOpen} color="love" {...rest} />
                <div className={classes.mainPanel} ref="mainPanel">
                    <Header routes={routes} handleDrawerToggle={this.handleDrawerToggle} {...rest} />
                    <div className={classes.content}>
                        <h2 className={classes.title}>{title}</h2>
                        <div className={classes.container}>{this.switcher()}</div>
                    </div>
                </div>
            </div>
        );
    }
}

App.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(App);
