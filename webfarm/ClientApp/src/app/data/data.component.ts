import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../data.service';
import { reading } from '../models/reading.model';
import { Chart, ChartConfiguration, registerables } from 'chart.js'
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.scss'],
  providers: [DatePipe]
})
export class DataComponent implements OnInit {

  private readings: reading[] = [];
  @ViewChild('data', { static: true })
  private chartRef: ElementRef;
  private chart: Chart;

  public from: string;
  public to: string;
  private defaultFrom: string;
  private defaultTo: string;

  constructor(private readonly dataService: DataService, private readonly datePipe: DatePipe) {
  }
  ngOnInit(): void {
    this.defaultTo = this.datePipe.transform(Date.now(), 'M/d/yy HH:mm:ss');
    this.defaultFrom = this.datePipe.transform(Date.now() - 172800000, 'M/d/yy HH:mm:ss');
    this.from = this.defaultFrom;
    this.to = this.defaultTo;
    Chart.register(...registerables);
    this.dataService.getReadings(this.from, this.to).subscribe(result => {
      this.readings = result;
      this.createChart();
    })
  }

  onUpdate($event): void {
    this.dataService.getReadings(this.from, this.to).subscribe(result => {
      this.readings = result;
      this.chart.data.labels = this.readings.map(x => this.datePipe.transform(x.at, 'short'));
      this.chart.data.datasets[0].data = this.readings.map(x => x.temperature);
      this.chart.data.datasets[1].data = this.readings.map(x => x.humidity);
      this.chart.update();
    });
  }

  formatDate(property: string): void {
    if (property == 'from') {
      const parsedDate = Date.parse(this.from);
      if (isNaN(parsedDate) || parsedDate === null) {
        this.from = this.defaultFrom;
        return;
      }
      this.from = this.datePipe.transform(parsedDate, 'M/d/yy HH:mm:ss');
    }
    else if (property == 'to') {
      const parsedDate = Date.parse(this.to);
      if (isNaN(parsedDate) || parsedDate === null) {
        this.to = this.defaultTo;
        return;
      }
      this.to = this.datePipe.transform(parsedDate, 'M/d/yy HH:mm:ss');
    }
  }

  createChart(): void {
    const options = {
      type: 'line',
      data: {
        labels: this.readings.map(x => this.datePipe.transform(x.at, 'short')),
        datasets: [{
          data: this.readings.map(x => x.temperature),
          label: 'Temperature',
          borderColor: 'rgb(255, 206, 86)',
          backgroundColor: 'rgb(255, 206, 86)'
        },
        {
          data: this.readings.map(x => x.humidity),
          label: 'Humidity',
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgb(75, 192, 192)'
        }]
      },
      options: {
        scales: {
          xAxes: {
            ticks: {
              autoSkip: true,
              maxTicksLimit: 30
            }
          }
        },
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          tooltip: {
            position: 'nearest'
          }
        }
      }
    } as ChartConfiguration;
    this.chart = new Chart(this.chartRef.nativeElement, options);
  }


}
