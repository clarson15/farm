"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
class App {
    constructor(controllers, port = 8080) {
        this.app = express();
        this.port = port;
        this.initializeMiddlewares();
        this.initializeControllers(controllers);
        this.addStaticRoute();
    }
    listen() {
        this.app.listen(this.port, () => {
            console.log(`App listening on the port ${this.port}`);
        });
    }
    initializeMiddlewares() {
        this.app.use(bodyParser.json());
    }
    initializeControllers(controllers) {
        controllers.forEach((controller) => {
            this.app.use('/', controller.router);
        });
    }
    addStaticRoute() {
        const spa = path.resolve(__dirname + '/../ClientApp/dist/ClientApp');
        this.app.use('/', express.static(spa));
        this.app.get('*', (req, resp) => {
            resp.sendFile(path.resolve(spa, 'index.html'));
        });
    }
}
exports.App = App;
