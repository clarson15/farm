import { IController } from "../interfaces/controller.interface";
import * as express from 'express';
import * as mysql from 'mysql';
import * as net from 'net';
import { schedule } from '../models/schedule.model';
import { log } from '../models/log.model';

export class DashboardController implements IController {
    public readonly path: string = '/Dashboard';
    public router = express.Router();
    private data: mysql.Connection;

    constructor() {
        this.initializeRoutes();
        this.connectToDatabase();
    }

    private initializeRoutes(): void {
        this.router.get(`${this.path}/status`, this.getStatus.bind(this));
        this.router.get(`${this.path}/toggle`, this.toggleLights.bind(this));
        this.router.get(`${this.path}/errors`, this.getErrors.bind(this));
    }

    private connectToDatabase(): void {
        this.data = mysql.createConnection({
            host: 'localhost',
            user: 'pi',
            password: process.env.pass,
            database: 'farm'
        });
        this.data.on('error', (err) => {
            this.connectToDatabase();
            console.log(err);
        });
    }

    private connectToClient(data: string, callback: (data: string) => void): void {
        let client = new net.Socket();
        client.connect(48307, '127.0.0.1', () => {
            console.log('Successfully connected to script');
            client.write(data);
        });
        client.on('data', (returnData => {
            callback(returnData.toString('ascii'));
            client.destroy();
        }));
        client.on('error', (err) => {
            console.log(err);
            client.destroy();
        });
        client.on('end', () => {
            client.destroy();
        });
        client.on('timeout', () => {
            client.destroy();
        })
    }

    private readFromDatabase(query: string, next: express.NextFunction, callback: (data: any[]) => void): void {
        this.data.query(query, (err, result) => {
            if (err) {
                console.log(err);
                next(err);
            }
            callback(result);
        });
    }

    private getStatus(request: express.Request, response: express.Response, next: express.NextFunction): void {
        this.connectToClient('status', (data) => {
            const resp = data.split(',');
            response.send({
                lights: resp[0] === 'True',
                temp: Number(resp[1]),
                humidity: Number(resp[2])
            });
        });
    }
    private toggleLights(request: express.Request, response: express.Response, next: express.NextFunction): void {
        const state = String(request.query.state);
        this.connectToClient(`toggle ${state}`, (data) => {
            if (data === '1') {
                response.send();
            }
            else {
                response.status(500);
                response.send();
            }
        })
    }
    private getErrors(request: express.Request, response: express.Response, next: express.NextFunction): void {
        const from = new Date();
        from.setDate(from.getDate() - 5);
        const query = `WHERE at>='${this.getDateString(from)}' AND level=2`;
        this.readFromDatabase(`SELECT id, level, message, at FROM logs ${query} ORDER BY at DESC LIMIT 0, 5;`, next, (data: log[]) => {
            response.send(data);
        });
    }

    private getDateString(date: Date): string {
        return `${date.getFullYear().toString().padStart(4, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
    }
}