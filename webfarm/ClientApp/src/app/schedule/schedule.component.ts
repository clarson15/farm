import { Component, ElementRef, Inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataService } from '../data.service';
import { schedule } from '../models/schedule.model';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {

  public schedule: schedule[] = [];
  private seconds = 86400;
  public newDisabled: boolean = false;
  public newTime: string = '00:00';
  public newLight: boolean;

  @ViewChild('closeModalButton', { static: true })
  private closeModalButton: ElementRef;

  @ViewChild('graphic', { static: true })
  private graphic: ElementRef;

  constructor(private readonly dataService: DataService, private readonly renderer: Renderer2) {
  }
  ngOnInit(): void {
    this.dataService.getSchedule().subscribe(x => {
      this.schedule = x;
      this.orderSchedule();
      this.buildGraphic();
      this.validateNewTime();
    });
  }

  validateNewTime(): void {
    const seconds = this.getTotalSeconds(this.newTime + ':00');
    this.newDisabled = this.schedule.filter(x => this.getTotalSeconds(x.at) === seconds).length > 0;
  }

  onNewTimeChanged(): void {
    if (!this.newTime.includes(':')) {
      const value = parseInt(this.newTime);
      if (!isNaN(value)) {
        this.newTime = Math.max(Math.min(value, 23), 0).toString().padStart(2, '0') + ":00";
        return;
      }
      this.newTime = '00:00';
      return;
    }
    let hour = parseInt(this.newTime.substring(0, this.newTime.indexOf(':')));
    let minute = parseInt(this.newTime.substring(this.newTime.indexOf(':') + 1));
    if (isNaN(hour)) {
      hour = 0;
    }
    if (isNaN(minute)) {
      minute = 0;
    }
    this.newTime = Math.max(Math.min(hour, 23), 0).toString().padStart(2, '0') + ':' + Math.max(Math.min(minute, 59), 0).toString().padStart(2, '0');
    this.validateNewTime();
  }

  onDelete(index: number): void {
    this.schedule.splice(index, 1);
    this.buildGraphic();
  }

  onSave(): void {
    this.dataService.saveSchedule(this.schedule).subscribe();
  }

  onSaveNew(): void {
    this.onNewTimeChanged();
    if (this.newDisabled) {
      return;
    }
    this.schedule.push({
      enabled: this.newLight,
      at: this.newTime + ':00',
      id: undefined
    });
    this.orderSchedule();
    this.buildGraphic();
    this.closeModal();
  }

  orderSchedule(): void {
    this.schedule = this.schedule.sort((a, b) => a.at > b.at ? 1 : -1);
    this.schedule.forEach((v, i) => {
      v.id = i + 1;
    })
  }

  closeModal(): void {
    this.newTime = '00:00';
    this.newDisabled = true;
    this.newLight = false;
    this.closeModalButton.nativeElement.click();
  }

  getTotalSeconds(input: string): number {
    const hours = parseInt(input.substring(0, 2));
    const minutes = parseInt(input.substring(3, 5));
    const seconds = parseInt(input.substring(6));
    return seconds + minutes * 60 + hours * 3600;
  }

  buildGraphic(): void {
    while (this.graphic.nativeElement.firstChild) {
      this.renderer.removeChild(this.graphic.nativeElement, this.graphic.nativeElement.lastChild);
    }
    if (this.schedule.length == 0) {
      return;
    }
    let seconds = this.getTotalSeconds(this.schedule[0].at);
    if (seconds !== 0) {
      const newItem = this.renderer.createElement('div') as HTMLDivElement;
      const width = seconds / this.seconds;
      newItem.style.width = width * 100 + '%';
      newItem.style.borderRight = '1px black solid';
      newItem.style.height = '48px';
      newItem.style.backgroundColor = this.schedule[this.schedule.length - 1].enabled ? 'rgb(255, 255, 255)' : 'rgb(128, 128, 128)';
      newItem.style.display = 'inline-block';
      newItem.style.writingMode = 'vertical-lr';
      newItem.style.textAlign = 'center';
      const text = this.renderer.createText('00:00');
      this.renderer.appendChild(newItem, text);
      this.renderer.appendChild(this.graphic.nativeElement, newItem);
    }
    this.schedule.forEach((x, i) => {
      seconds = this.getTotalSeconds(x.at);
      const newItem = this.renderer.createElement('div') as HTMLDivElement;
      if (i == this.schedule.length - 1) {
        const width = `${((this.seconds - seconds) / this.seconds) * 100}%`;
        newItem.style.width = width;
      }
      else {
        const nextSeconds = this.getTotalSeconds(this.schedule[i + 1].at);
        newItem.style.borderRight = "1px black solid";
        newItem.style.width = ((nextSeconds - seconds) / this.seconds) * 100 + '%';
      }
      newItem.style.height = '48px';

      newItem.style.backgroundColor = x.enabled ? 'rgb(255, 255, 255)' : 'rgb(128, 128, 128)';
      newItem.style.display = 'inline-block';
      newItem.style.writingMode = 'vertical-lr';
      newItem.style.textAlign = 'center';
      const text = this.renderer.createText(`${x.at.substring(0, 5)}`);
      this.renderer.appendChild(newItem, text);
      this.renderer.appendChild(this.graphic.nativeElement, newItem);
    });
  }

  getTimeString(item: schedule): string {
    return item.at.substring(0, 5);
  }
}
