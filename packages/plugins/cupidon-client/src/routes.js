import React from "react";
import ExtensionsComponents from "extensions/index";

const routes = [];
const extensions = __CUPIDON_EXTENSIONS__;

for (let extension of extensions) {
    let route = {
        ext: extension.name,
        path: `/${extension.name}`,
        sidebarName: extension.title,
        navbarName: extension.title,
        icon: extension.icon,
        component: ExtensionsComponents[extension.name]
    };
    routes.push(route);
}

routes.push({ redirect: true, path: "/", to: "/love", navbarName: "Redirect" });
export default routes;
