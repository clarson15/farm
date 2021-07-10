import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as path from 'path';
import { IController } from './interfaces/controller.interface';

export class App {
    public app: express.Application;
    private port: number;
    constructor(controllers: IController[], port: number = 8080) {
        this.app = express();
        this.port = port;
        this.initializeMiddlewares();
        this.initializeControllers(controllers);
        this.addStaticRoute();
    }

    public listen() {
        this.app.listen(this.port, () => {
            console.log(`App listening on the port ${this.port}`);
        });
    }

    private initializeMiddlewares() {
        this.app.use(bodyParser.json());
    }

    private initializeControllers(controllers: IController[]) {
        controllers.forEach((controller) => {
            this.app.use('/', controller.router);
        });
    }

    private addStaticRoute() {
        const spa = path.resolve(__dirname + '/../ClientApp/dist/ClientApp');
        this.app.use('/', express.static(spa));
        this.app.get('*', (req, resp) => {
            resp.sendFile(path.resolve(spa, 'index.html'));
        })
    }
}