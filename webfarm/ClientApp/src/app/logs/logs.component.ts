import { Component, Inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataService } from '../data.service';
import { log } from '../models/log.model';
import { TableResult } from '../models/table-result.model';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss']
})
export class LogsComponent implements OnInit {

  public logs: TableResult<log>;
  public page: number = 0;
  public lastPage: number = 0;
  public pageSize: number = 25;

  constructor(private readonly dataService: DataService) {
  }
  ngOnInit(): void {
    this.logs = { count: 0, items: [] } as TableResult<log>;
    this.getLogs();
  }

  getLogs(): void {
    this.dataService.getLogs(this.page * this.pageSize, this.pageSize).subscribe(x => {
      this.logs = x;
      this.lastPage = (this.logs.count - (this.logs.count % this.pageSize)) / this.pageSize;
      if (this.logs.count % this.pageSize == 0) {
        this.lastPage--;
      }
    });
  }

  onNext(): void {
    if (this.page == this.lastPage) {
      return;
    }
    this.page += 1;
    this.getLogs();
  }

  onLast(): void {
    this.page = this.lastPage;
    this.getLogs();
  }

  onPrevious(): void {
    if (this.page == 0) {
      return;
    }
    this.page -= 1;
    this.getLogs();
  }

  onFirst(): void {
    this.page = 0;
    this.getLogs();
  }

  parseLogLevel(level: number): string {
    switch (level) {
      case 0:
        return 'DEBUG';
      case 1:
        return 'WARNING';
      case 2:
        return 'ERROR';
      default:
        return 'UNKNOWN';
    }
  }


}
