"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const data_controller_1 = require("./controllers/data.controller");
const dashboard_controller_1 = require("./controllers/dashboard.controller");
const app = new app_1.App([
    new data_controller_1.DataController(),
    new dashboard_controller_1.DashboardController()
]);
app.listen();
