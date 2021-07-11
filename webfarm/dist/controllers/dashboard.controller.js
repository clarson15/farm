"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const express = require("express");
const mysql = require("mysql");
const net = require("net");
class DashboardController {
    constructor() {
        this.path = '/Dashboard';
        this.router = express.Router();
        this.initializeRoutes();
        this.connectToDatabase();
    }
    initializeRoutes() {
        this.router.get(`${this.path}/status`, this.getStatus.bind(this));
        this.router.get(`${this.path}/toggle`, this.toggleLights.bind(this));
        this.router.get(`${this.path}/errors`, this.getErrors.bind(this));
    }
    connectToDatabase() {
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
    connectToClient(data, callback) {
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
        });
    }
    readFromDatabase(query, next, callback) {
        this.data.query(query, (err, result) => {
            if (err) {
                console.log(err);
                next(err);
            }
            callback(result);
        });
    }
    getStatus(request, response, next) {
        this.connectToClient('status', (data) => {
            const resp = data.split(',');
            response.send({
                lights: resp[0] === 'True',
                temp: Number(resp[1]),
                humidity: Number(resp[2])
            });
        });
    }
    toggleLights(request, response, next) {
        const state = String(request.query.state);
        this.connectToClient(`toggle ${state}`, (data) => {
            if (data === '1') {
                response.send();
            }
            else {
                response.status(500);
                response.send();
            }
        });
    }
    getErrors(request, response, next) {
        const from = new Date();
        from.setDate(from.getDate() - 5);
        const query = `WHERE at>='${this.getDateString(from)}' AND level=2`;
        this.readFromDatabase(`SELECT id, level, message, at FROM logs ${query} ORDER BY at DESC LIMIT 0, 5;`, next, (data) => {
            response.send(data);
        });
    }
    getDateString(date) {
        return `${date.getFullYear().toString().padStart(4, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
    }
}
exports.DashboardController = DashboardController;
