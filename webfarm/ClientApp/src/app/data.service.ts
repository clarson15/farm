import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { log } from './models/log.model';
import { reading } from './models/reading.model';
import { schedule } from './models/schedule.model';
import { TableResult } from './models/table-result.model';

@Injectable({
    providedIn: 'root',
})
export class DataService {

    private readonly baseUrl = "Data/";

    constructor(private readonly httpClient: HttpClient) { }

    getLogs(skip: number, take: number, level?: number): Observable<TableResult<log>> {
        let route = `logs?skip=${skip}&take=${take}`;
        if (level != null) {
            route += `&level=${level}`;
        }
        return this.httpClient.get<TableResult<log>>(this.baseUrl + route);
    }

    getSchedule(): Observable<schedule[]> {
        return this.httpClient.get<schedule[]>(this.baseUrl + "schedule");
    }

    saveSchedule(schedule: schedule[]): Observable<void> {
        return this.httpClient.post<void>(this.baseUrl + 'schedule', schedule);
    }

    getReadings(from: string, to: string): Observable<reading[]> {
        return this.httpClient.get<reading[]>(this.baseUrl + `readings?from=${from}&to=${to}`);
    }

}