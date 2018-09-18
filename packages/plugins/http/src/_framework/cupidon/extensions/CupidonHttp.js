import React from "react";
import _ from "lodash";

import { Link } from "react-router-dom";

import Panel from "components/Panel/Panel";
import { getServiceLink } from "./love";

import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

class ContextDialog extends React.Component {
    render() {
        const { context, handleClose } = this.props;
        if (!context) {
            return "";
        }

        return (
            <Dialog
                open={context ? true : false}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">Context #{context.id}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">More info about this context with tabs and stuff ?</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

const styles = theme => ({
    context_button: {
        padding: "8px",
        lineHeight: "10px",
        minHeight: "auto",
        fontWeight: "bold",
        fontSize: "12px",
        fontFamily: "monospace"
    },
    bg_success: {
        backgroundColor: theme.palette.success.main
    },
    bg_error: {
        backgroundColor: theme.palette.error.main
    },
    fg_success: {
        color: theme.palette.success.main
    },
    fg_error: {
        color: theme.palette.error.main
    }
});

const getColorClass = status => {
    switch (status / 100) {
        case 2:
        case 3:
            return "success";
        case 4:
        case 5:
            return "error";
    }
};

class HttpComponent extends React.Component {
    state = {
        context: null,
        data: {
            contexts: [],
            middlewares: [],
            servers: []
        }
    };

    componentDidMount() {
        this.props.emitter.on(this.handleMessage);
        this.refreshData();
    }

    componentWillUnmount() {
        this.props.emitter.off(this.handleMessage);
    }

    handleMessage = context => {
        const newContexts = [...this.state.data.contexts];
        const idx = _.findIndex(newContexts, { id: context.id });
        if (idx != -1) {
            newContexts[idx] = context;
        } else {
            newContexts.unshift(context);
        }
        this.setState({ data: { ...this.state.data, contexts: newContexts } });
    };

    refreshData = () => {
        this.props.api("initial").then(res => {
            if (res && res.data) {
                this.setState({ data: res.data });
            }
        });
    };

    getContext = contextId => {
        return this.props.api("context", { context: contextId }).then(res => {
            if (res && res.data) {
                return res.data;
            }
        });
    };

    openContext = contextId => {
        this.getContext(contextId).then(context => this.setState({ context }));
    };

    closeContext = () => {
        this.setState({ context: null });
    };

    render() {
        const {
            data: { contexts, middlewares, servers },
            context
        } = this.state;
        const { classes } = this.props;

        return (
            <Grid container spacing={16}>
                <ContextDialog context={context} handleClose={this.closeContext} />
                <Grid item md={3}>
                    <Panel title="HTTP Servers" color="">
                        {servers.map(({ service, factory, handler, uws, listen }, idx) => (
                            <List dense={true} key={service}>
                                <ListItem>
                                    <ListItemText primary={service} secondary="Service Id" />
                                </ListItem>
                                <ListItem>
                                    <ListItemText primary={factory} secondary="Factory Service" />
                                </ListItem>
                                <ListItem>
                                    <ListItemText primary={handler} secondary="Handler Service" />
                                </ListItem>
                                <ListItem>
                                    <ListItemText primary={uws ? "yes" : "no"} secondary="UWS" />
                                </ListItem>
                                <ListItem>
                                    <ListItemText primary={`${listen.host}:${listen.port}`} secondary="Listening" />
                                </ListItem>
                            </List>
                        ))}
                    </Panel>
                    <Panel title="Middlewares available" color="purple">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Service</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {middlewares.map(middleware => {
                                    return (
                                        <TableRow key={middleware.name}>
                                            <TableCell>{middleware.name}</TableCell>
                                            <TableCell>
                                                <Link to={getServiceLink(middleware.service)}>{middleware.service}</Link>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </Panel>
                </Grid>
                <Grid item md={9}>
                    <Panel title="HTTP Requests" color="blue">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Context #</TableCell>
                                    <TableCell>Method</TableCell>
                                    <TableCell>Path</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Time</TableCell>
                                    <TableCell>Route</TableCell>
                                    <TableCell>Error</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {contexts.map(context => {
                                    return (
                                        <TableRow key={context.id}>
                                            <TableCell>
                                                <Button
                                                    className={[
                                                        classes.context_button,
                                                        classes[`bg_${getColorClass(context.status)}`]
                                                    ].join(" ")}
                                                    onClick={() => this.openContext(context.id)}
                                                >
                                                    {context.id}
                                                </Button>
                                            </TableCell>
                                            <TableCell>{context.method}</TableCell>
                                            <TableCell>{context.path}</TableCell>
                                            <TableCell className={classes[`fg_${getColorClass(context.status)}`]}>
                                                {context.status}
                                            </TableCell>
                                            <TableCell>{context.time}</TableCell>
                                            <TableCell>{context.attributes._route_name}</TableCell>
                                            <TableCell>{context.error ? context.error.message : ""}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </Panel>
                </Grid>
            </Grid>
        );
    }
}

export default withStyles(styles)(HttpComponent);
