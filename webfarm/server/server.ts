import { App } from "./app";
import { DataController } from './controllers/data.controller';
import { DashboardController } from './controllers/dashboard.controller';

const app = new App([
    new DataController(),
    new DashboardController()
]);

app.listen();