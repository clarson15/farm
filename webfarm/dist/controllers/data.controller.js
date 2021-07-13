"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataController = void 0;
const express = require("express");
const mysql = require("mysql");
class DataController {
    constructor() {
        this.path = '/Data';
        this.router = express.Router();
        this.initializeRoutes();
        this.connectToDatabase();
    }
    initializeRoutes() {
        this.router.get(`${this.path}/logs`, this.getLogs.bind(this));
        this.router.get(`${this.path}/schedule`, this.getSchedule.bind(this));
        this.router.post(`${this.path}/schedule`, this.setSchedule.bind(this));
        this.router.get(`${this.path}/readings`, this.getReadings.bind(this));
    }
    connectToDatabase() {
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
    queryDatabase(query, next, callback) {
        this.data.query(query, (err, result) => {
            if (err) {
                console.log(err);
                next(err);
            }
            callback(result);
        });
    }
    setSchedule(request, response, next) {
        this.queryDatabase('DELETE FROM schedule;', next, () => {
            let query = 'INSERT INTO schedule (id, at, enabled) VALUES ';
            request.body.forEach((x, index) => {
                query += `(${index}, '${x.at}', ${x.enabled}), `;
            });
            query = query.substring(0, query.length - 2);
            this.queryDatabase(query, next, () => {
                response.send();
            });
        });
    }
    getSchedule(request, response, next) {
        this.queryDatabase('SELECT id, at, enabled FROM schedule;', next, (data) => {
            response.send(data);
        });
    }
    getLogs(request, response, next) {
        const level = Number(request.query.level);
        const take = Number(request.query.take);
        const skip = Number(request.query.skip);
        const levelQuery = isNaN(level) ? '' : `WHERE level=${level}`;
        this.queryDatabase(`SELECT id, level, message, at FROM logs ${levelQuery} ORDER BY at DESC LIMIT ${skip}, ${take};`, next, (data) => {
            this.queryDatabase(`SELECT COUNT(*) as count FROM logs ${levelQuery};`, next, (result) => {
                const count = result[0].count;
                response.send({
                    count: count,
                    items: data
                });
            });
        });
    }
    getReadings(request, response, next) {
        const to = new Date(request.query.to);
        const from = new Date(request.query.from);
        const query = `WHERE at>='${this.getDateString(from)}' AND at<='${this.getDateString(to)}'`;
        this.queryDatabase(`SELECT id, temperature, humidity, at FROM readings ${query};`, next, (data) => {
            response.send(data);
        });
    }
    getDateString(date) {
        return `${date.getFullYear().toString().padStart(4, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
    }
}
exports.DataController = DataController;
