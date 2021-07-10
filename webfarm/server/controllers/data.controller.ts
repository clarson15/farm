import { IController } from "../interfaces/controller.interface";
import * as express from 'express';
import * as mysql from 'mysql';
import { schedule } from '../models/schedule.model';
import { log } from '../models/log.model';
import { reading } from '../models/reading.model';
import { tableResult } from '../models/table-result.model'

export class DataController implements IController {
    public readonly path: string = '/Data';
    public router = express.Router();
    private data: mysql.Connection;

    constructor() {
        this.initializeRoutes();
        this.connectToDatabase();
    }

    private initializeRoutes(): void {
        this.router.get(`${this.path}/logs`, this.getLogs.bind(this));
        this.router.get(`${this.path}/schedule`, this.getSchedule.bind(this));
        this.router.post(`${this.path}/schedule`, this.setSchedule.bind(this));
        this.router.get(`${this.path}/readings`, this.getReadings.bind(this));
    }

    private connectToDatabase(): void {
        this.data = mysql.createConnection({
            host: 'localhost',
            user: 'pi',
            password: process.env.pass,
            database: 'farm'
        });
        this.data.on('error', (err) => {
            console.log(err);
        });
    }

    private queryDatabase(query: string, next: express.NextFunction, callback: (data: any[]) => void): void {
        this.data.query(query, (err, result) => {
            if (err) {
                console.log(err);
                next(err);
            }
            callback(result);
        });
    }

    private setSchedule(request: express.Request, response: express.Response, next: express.NextFunction): void {
        this.queryDatabase('DELETE FROM schedule;', next, () => {
            let query = 'INSERT INTO schedule (id, at, enabled) VALUES '
            request.body.forEach((x: schedule, index: number) => {
                query += `(${index}, '${x.at}', ${x.enabled}), `
            });
            query = query.substring(0, query.length - 2);
            this.queryDatabase(query, next, () => {
                response.send();
            })
        });
    }

    private getSchedule(request: express.Request, response: express.Response, next: express.NextFunction): void {
        this.queryDatabase('SELECT id, at, enabled FROM schedule;', next, (data: schedule[]) => {
            response.send(data);
        })
    }
    private getLogs(request: express.Request, response: express.Response, next: express.NextFunction): void {
        const level: number = Number(request.query.level);
        const take: number = Number(request.query.take);
        const skip: number = Number(request.query.skip);
        const levelQuery = isNaN(level) ? '' : `WHERE level=${level}`;
        this.queryDatabase(`SELECT id, level, message, at FROM logs ${levelQuery} ORDER BY at DESC LIMIT ${skip}, ${take};`, next, (data: log[]) => {
            this.queryDatabase(`SELECT COUNT(*) as count FROM logs ${levelQuery};`, next, (result) => {
                const count = result[0].count;
                response.send({
                    count: count,
                    items: data
                } as tableResult<log>);
            })
        });
    }
    private getReadings(request: express.Request, response: express.Response, next: express.NextFunction): void {
        const to: Date = new Date(request.query.to as string);
        const from: Date = new Date(request.query.from as string);
        const query = `WHERE at>='${this.getDateString(from)}' AND at<='${this.getDateString(to)}'`;
        this.queryDatabase(`SELECT id, temperature, humidity, at FROM readings ${query};`, next, (data: reading[]) => {
            response.send(data);
        });
    }

    private getDateString(date: Date): string {
        return `${date.getFullYear().toString().padStart(4, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
    }
}