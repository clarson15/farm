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
export class DashboardService {

    private readonly baseUrl = "Dashboard/";

    constructor(private readonly httpClient: HttpClient) { }

    getStatus(): Observable<any> {
        return this.httpClient.get(this.baseUrl + 'status');
    }

    toggle(state: boolean): Observable<void> {
        return this.httpClient.get<void>(this.baseUrl + `toggle?state=${state}`);
    }

    getErrors(): Observable<log[]> {
        return this.httpClient.get<log[]>(this.baseUrl + 'errors');
    }

}