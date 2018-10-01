import React from "react";
import _ from "lodash";
import moment from "moment";

import queryString from "query-string";
import { withRouter } from "react-router";

import Panel from "components/Panel/Panel";
import PanelInput from "components/Panel/PanelInput";
import PanelTabs from "components/Panel/PanelTabs";

import { withStyles } from "@material-ui/core/styles";
import Portal from "@material-ui/core/Portal";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";

import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

import SwipeableViews from "react-swipeable-views";

const styles = theme => ({
    tags: {
        listStyleType: "none",
        padding: 0
    },
    log: {
        backgroundColor: "#333",
        color: "#FFF",
        padding: "3px 6px",
        fontSize: "11px",
        minHeight: "auto",
        lineHeight: "10px",
        fontWeight: "bold",
        borderRadius: "4px"
    },
    log_error: { backgroundColor: theme.palette.error.main, color: theme.palette.error.textContrast },
    log_warning: { backgroundColor: theme.palette.warning.main, color: theme.palette.warning.textContrast },
    log_info: { backgroundColor: theme.palette.info.main, color: theme.palette.info.textContrast },
    log_debug: { backgroundColor: theme.palette.debug.main, color: theme.palette.debug.textContrast },
    fg_log_error: { color: theme.palette.error.main },
    fg_log_warning: { color: theme.palette.warning.main },
    fg_log_info: { color: theme.palette.info.main },
    fg_log_debug: { color: theme.palette.debug.main },
    log_ts: { fontSize: 11, float: "right" },
    log_dialog: { minWidth: 350 },
    error_stack: { color: "#FFF", fontFamily: "monospace" }
});

const getLevelClasses = (level, classes, fg = false) => [classes.log, classes[`${fg ? "fg_" : ""}log_${level}`]].join(" ");
const stringOrJson = value => (typeof value == "string" ? value : JSON.stringify(value));

class LogDialog extends React.Component {
    render() {
        const {
            handleClose,
            classes,
            log: { timestamp, path, level, message, stack, ...rest }
        } = this.props;

        return (
            <Dialog open={true} onClose={handleClose} hideBackdrop={true} classes={{ paper: classes.log_dialog }}>
                <DialogTitle>
                    <span className={getLevelClasses(level, classes)}>{level}</span>

                    {timestamp && (
                        <small className={classes.log_ts}>
                            {moment(timestamp).format("LL")} {moment(timestamp).format("LTS")}
                        </small>
                    )}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText className={getLevelClasses(level, classes, true)}>{stringOrJson(message)}</DialogContentText>
                    {stack && <pre className={classes.error_stack}>{stack.map(s => stringOrJson(s)).join("\n")}</pre>}
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

const Logs = ({ logs, classes, openLog }) => (
    <Table>
        <TableBody>
            {logs &&
                logs.map((log, idx) => {
                    const { timestamp, level, message, stack, ...rest } = log;
                    return (
                        <TableRow key={idx} hover={true} onClick={() => openLog(log)}>
                            <TableCell>{timestamp && moment(timestamp).fromNow()}</TableCell>
                            <TableCell>
                                <span className={getLevelClasses(level, classes)}>{level}</span>
                            </TableCell>
                            <TableCell>{stringOrJson(message)}</TableCell>
                            <TableCell>
                                {_.map(rest, (value, name) => (
                                    <div key={name}>
                                        {name}: <strong>{stringOrJson(value)}</strong>
                                    </div>
                                ))}
                            </TableCell>
                        </TableRow>
                    );
                })}
        </TableBody>
    </Table>
);

class LoveExtensionComponent extends React.Component {
    constructor(props) {
        super(props);

        let search_service = null;
        const params = queryString.parse(props.location.search);
        if (params.service) {
            search_service = params.service;
        }

        this.state = {
            panel: 0,
            logger: 0,
            logs: {},
            open_logs: [],
            usage: {},
            data: {
                love: {},
                env: [],
                services: [],
                plugins: [],
                loggers: []
            },
            search_service,
            search_env: ""
        };
    }

    componentDidMount() {
        this.props.emitter.on(this.handleMessage);
        this.refreshData();
    }

    componentWillUnmount() {
        this.props.emitter.off(this.handleMessage);
    }

    handleMessage = usage => {
        this.setState({ usage });
    };

    refreshData() {
        this.props.api("initial").then(res => {
            if (res && res.data) {
                const data = res.data;
                this.setState({ data });
                this.getLogs(this.state.logger);
            }
        });
    }

    handleSearchService = event => {
        this.setState({ search_service: event.target.value });
    };

    handleSearchEnv = event => {
        this.setState({ search_env: event.target.value });
    };

    handleChangePanel = (event, panel) => {
        this.setPanel(panel);
    };

    setPanel = panel => {
        this.setState({ panel });
    };

    handleChangeLogger = (event, logger) => {
        this.setLogger(logger);
    };

    setLogger = logger => {
        this.setState({ logger });
        this.getLogs(this.state.logger);
    };

    envMatch = env => {
        if (!this.state.search_env) {
            return true;
        }
        let search = this.state.search_env.toLowerCase().trim();

        return env.key.toLowerCase().indexOf(search) != -1;
    };

    serviceMatch = service => {
        if (!this.state.search_service) {
            return true;
        }
        let search = this.state.search_service.toLowerCase().trim();
        let serviceId = service.id.toLowerCase();

        if (search[0] === "@") {
            return search.slice(1) === serviceId;
        }

        return serviceId.indexOf(search) != -1;
    };

    getLogs = (loggerIndex, start = 0, limit = 100) => {
        const logger = this.state.data.loggers[loggerIndex];
        return this.props.api("logs", { logger, start, limit }).then(res => {
            if (res && res.data) {
                this.setState({ logs: { ...this.state.logs, [logger]: res.data } });
            }
        });
    };

    openLog = log => {
        this.setState({ open_logs: [...this.state.open_logs, log] });
    };

    closeLog = log => {
        this.setState({ open_logs: _.without(this.state.open_logs, log) });
    };

    render() {
        const { classes } = this.props;
        const {
            data: { love, env, services, plugins, loggers },
            usage,
            panel,
            logger,
            logs,
            open_logs,
            search_service,
            search_env
        } = this.state;

        const mb = mb => `${Math.round(mb / 1024 / 1024, 2)} MB`;

        const serviceFrom = service => {
            switch (service.type) {
                case "factory":
                    return (
                        <span>
                            {service.from.service}.{service.from.method}()
                        </span>
                    );
                default:
                    return service.from;
            }
        };

        const serviceTags = service => {
            if (!service.tags) return "";
            return (
                <ul className={classes.tags}>
                    {service.tags.map((tag, idx) => (
                        <li key={`tag${idx}`}>
                            <strong>{tag.name}</strong> {tag.data && `(${_.map(tag.data, (v, k) => `${k}: ${v}`).join(", ")})`}
                        </li>
                    ))}
                </ul>
            );
        };

        return (
            <>
                {love && love.version && <Portal container={() => document.getElementById("lovejs-version")}>{love.version}</Portal>}
                {usage && (
                    <Portal container={() => document.getElementById("memory-usage")}>
                        <List dense={true}>
                            <ListItem>
                                <ListItemText primary={mb(usage.heapUsed)} secondary="Heap Used" />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary={mb(usage.heapTotal)} secondary="Heap Total" />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary={mb(usage.rss)} secondary="Resident Set Size" />
                            </ListItem>
                        </List>
                    </Portal>
                )}
                {open_logs &&
                    open_logs.map((log, idx) => <LogDialog key={idx} log={log} classes={classes} handleClose={() => this.closeLog(log)} />)}
                <Grid container spacing={16}>
                    <Grid item md={6}>
                        <PanelTabs value={logger} onChange={this.handleChangeLogger} tabs={loggers} />
                        <Panel>
                            <SwipeableViews axis="x" index={logger} onChangeIndex={this.setLogger}>
                                {loggers.map(logger => (
                                    <div key={logger}>
                                        {logs[logger] && <Logs openLog={this.openLog} logs={logs[logger]} classes={classes} />}
                                    </div>
                                ))}
                            </SwipeableViews>
                        </Panel>
                    </Grid>
                    <Grid item md={6}>
                        <PanelTabs value={panel} onChange={this.handleChangePanel} tabs={["Environment", "Services", "Plugins"]} />
                        <Panel>
                            <SwipeableViews axis="x" index={panel} onChangeIndex={this.setPanel}>
                                <div>
                                    <PanelInput
                                        type="search"
                                        label="Search env variable..."
                                        onChange={this.handleSearchEnv}
                                        defaultValue={search_env}
                                    />
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Key</TableCell>
                                                <TableCell>Value</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {env.filter(env => this.envMatch(env)).map(({ key, value }) => (
                                                <TableRow key={key}>
                                                    <TableCell>{key}</TableCell>
                                                    <TableCell>{JSON.stringify(value)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                <div>
                                    <PanelInput
                                        type="search"
                                        label="Search service"
                                        onChange={this.handleSearchService}
                                        defaultValue={search_service}
                                    />
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Service</TableCell>
                                                <TableCell>Type</TableCell>
                                                <TableCell>From</TableCell>
                                                <TableCell>Tags</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {services.filter(service => this.serviceMatch(service)).map(service => {
                                                const { id, type } = service;
                                                return (
                                                    <TableRow key={service.id}>
                                                        <TableCell>{id}</TableCell>
                                                        <TableCell>{type}</TableCell>
                                                        <TableCell>{serviceFrom(service)}</TableCell>
                                                        <TableCell>{serviceTags(service)}</TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                                <div>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Name</TableCell>
                                                <TableCell>Path</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {plugins.map(plugin => (
                                                <TableRow key={plugin.name}>
                                                    <TableCell>{plugin.name}</TableCell>
                                                    <TableCell>{plugin.path}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </SwipeableViews>
                        </Panel>
                    </Grid>
                </Grid>
            </>
        );
    }
}

export default withStyles(styles)(withRouter(LoveExtensionComponent));

export const getServiceLink = service => {
    return { pathname: "/love", search: `?service=@${service}` };
};
