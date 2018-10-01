import React from "react";
import _ from "lodash";
import { withStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";

import Panel from "components/Panel/Panel";
import PanelTabs from "components/Panel/PanelTabs";
import PanelInput from "components/Panel/PanelInput";

import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
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

import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";

const styles = theme => ({});

class TestExtension extends React.Component {
    state = {
        context: null,
        data: {
            contexts: [
                {
                    id: "ByUApO5fQ",
                    path: "/cupidon/query",
                    method: "GET",
                    status: 200,
                    time: null,
                    attributes: {
                        _cupidon_id: "ByUApO5fQ",
                        _route: {
                            matchers: { path: { path: "/cupidon/:query(.*)", params: {} }, env: ["development"] },
                            middlewares: { cupidon: null },
                            attributes: {}
                        },
                        _route_name: "cupidon",
                        _matchers: { path: { query: "query" }, env: true },
                        _middlewares: { cupidon: null }
                    },
                    error: null
                },
                {
                    id: "B1ezTpd9MQ",
                    path: "/cupidon/8cfe42427bdce7a53e1ace1745cfeed9.svg",
                    method: "GET",
                    status: 200,
                    time: null,
                    attributes: {
                        _cupidon_id: "B1ezTpd9MQ",
                        _route: {
                            matchers: { path: { path: "/cupidon/:query(.*)", params: {} }, env: ["development"] },
                            middlewares: { cupidon: null },
                            attributes: {}
                        },
                        _route_name: "cupidon",
                        _matchers: { path: { query: "8cfe42427bdce7a53e1ace1745cfeed9.svg" }, env: true },
                        _middlewares: { cupidon: null }
                    },
                    error: null
                },
                {
                    id: "ByGTa_qMm",
                    path: "/cupidon/query",
                    method: "GET",
                    status: 200,
                    time: null,
                    attributes: {
                        _cupidon_id: "ByGTa_qMm",
                        _route: {
                            matchers: { path: { path: "/cupidon/:query(.*)", params: {} }, env: ["development"] },
                            middlewares: { cupidon: null },
                            attributes: {}
                        },
                        _route_name: "cupidon",
                        _matchers: { path: { query: "query" }, env: true },
                        _middlewares: { cupidon: null }
                    },
                    error: null
                },
                {
                    id: "rkxZaTu5z7",
                    path: "/cupidon/main.bundle.js",
                    method: "GET",
                    status: 200,
                    time: null,
                    attributes: {
                        _cupidon_id: "rkxZaTu5z7",
                        _route: {
                            matchers: { path: { path: "/cupidon/:query(.*)", params: {} }, env: ["development"] },
                            middlewares: { cupidon: null },
                            attributes: {}
                        },
                        _route_name: "cupidon",
                        _matchers: { path: { query: "main.bundle.js" }, env: true },
                        _middlewares: { cupidon: null }
                    },
                    error: null
                },
                {
                    id: "BJb6pucGQ",
                    path: "/cupidon/",
                    method: "GET",
                    status: 200,
                    time: null,
                    attributes: {
                        _cupidon_id: "BJb6pucGQ",
                        _route: {
                            matchers: { path: { path: "/cupidon/:query(.*)", params: {} }, env: ["development"] },
                            middlewares: { cupidon: null },
                            attributes: {}
                        },
                        _route_name: "cupidon",
                        _matchers: { path: { query: "" }, env: true },
                        _middlewares: { cupidon: null }
                    },
                    error: null
                }
            ],
            middlewares: [
                {
                    name: "auth_basic",
                    service: "http.middleware.auth_basic",
                    module: "node_modules/@lovejs/http/src/Middlewares/KoaMiddlewares"
                },
                {
                    name: "bodyparser",
                    service: "http.middleware.bodyparser",
                    module: "node_modules/@lovejs/http/src/Middlewares/KoaMiddlewares"
                },
                {
                    name: "controller",
                    service: "http.middleware.controller",
                    module: "node_modules/@lovejs/http/src/Middlewares/ControllerMiddleware.js"
                },
                { name: "cors", service: "http.middleware.cors", module: "node_modules/@lovejs/http/src/Middlewares/KoaMiddlewares" },
                { name: "cupidon", service: "middleware.cupidon", module: "node_modules/@lovejs/cupidon/src/Cupidon/CupidonMiddleware.js" },
                {
                    name: "error_404",
                    service: "http.middleware.error_404",
                    module: "node_modules/@lovejs/http/src/Middlewares/Error404Middleware.js"
                },
                {
                    name: "favicon",
                    service: "http.middleware.favicon",
                    module: "node_modules/@lovejs/http/src/Middlewares/FaviconMiddleware.js"
                },
                {
                    name: "graphiql",
                    service: "middleware.graphiql",
                    module: "node_modules/@lovejs/graphql/src/routing/middlewares/GraphiqlMiddleware.js"
                },
                {
                    name: "graphql",
                    service: "middleware.graphql",
                    module: "node_modules/@lovejs/graphql/src/routing/middlewares/GraphqlMiddleware.js"
                },
                {
                    name: "graphql_upload",
                    service: "middleware.upload",
                    module: "node_modules/@lovejs/graphql/src/routing/middlewares/GraphqlUploadMiddleware.js"
                },
                {
                    name: "nextjs",
                    service: "middlewares.nextjs",
                    module: "node_modules/@lovejs/nextjs/src/middlewares/NextJsMiddleware.js"
                },
                {
                    name: "static",
                    service: "http.middleware.static",
                    module: "node_modules/@lovejs/http/src/Middlewares/StaticMiddleware.js"
                },
                { name: "timer", service: "http.middleware.timer", module: "node_modules/@lovejs/http/src/Middlewares/TimerMiddleware.js" }
            ],
            servers: [
                {
                    service: "http.server.default",
                    factory: "http.server.factory",
                    handler: "http.handler",
                    uws: false,
                    listen: { host: "127.0.0.1", port: 7777 }
                }
            ]
        }
    };

    render() {
        const {
            data: { contexts, middlewares, servers }
        } = this.state;

        const { classes } = this.props;

        return (
            <Grid container spacing={16}>
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
                    <PanelTabs fullWidth tabs={["Panel1", "Panel2", "Panel3", "Panel4", "Panel5"]} value={1} />
                    <Panel title="Middlewares available" color="purple">
                        <PanelInput type="search" label="Search something" />
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Service</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {middlewares.map((middleware, idx) => {
                                    return (
                                        <TableRow key={middleware.name}>
                                            <TableCell>{middleware.name}</TableCell>
                                            <TableCell>
                                                <a href="#">{middleware.name}</a>
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
                                    <TableCell>ID</TableCell>
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
                                                <Button size="small" variant="outlined" color="primary">
                                                    {context.id}
                                                </Button>
                                            </TableCell>
                                            <TableCell>{context.method}</TableCell>
                                            <TableCell>{context.path}</TableCell>
                                            <TableCell>{context.status}</TableCell>
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

export default withStyles(styles)(TestExtension);
