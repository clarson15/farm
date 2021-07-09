import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../dashboard.service';
import { log } from '../models/log.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public status: any;
  public errors: log[] = [];
  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.dashboardService.getStatus().subscribe(result => {
      this.status = result;
    });
    this.dashboardService.getErrors().subscribe(result => {
      this.errors = result;
    });
  }

  toggleLight(state: boolean): void {
    this.dashboardService.toggle(state).subscribe(result => {
      this.dashboardService.getStatus().subscribe(status => {
        this.status = status;
      });
    });
  }

}
