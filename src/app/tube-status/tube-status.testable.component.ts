import { Component, OnInit } from '@angular/core';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable()
export class StatusIndicatorService {
  statusIndicatorFor(lineStatuses: LineStatus[]): [string, string] {
    if (lineStatuses == null) {
      throw new Error("cannot process null list of statuses")
    }

    if (lineStatuses.length == 0) {
      return ["❓", "no idea"];
    }

    let mostSevereStatus = lineStatuses.reduce((previous, current) => {
      if (current.statusSeverity > previous.statusSeverity) {
        return current;
      } else {
        return previous;
      }
    })

    switch (mostSevereStatus.statusSeverity) {
      case 0: return ["✅", mostSevereStatus.statusSeverityDescription];
      case 3: return ["⭕️", mostSevereStatus.statusSeverityDescription];
      default: return ["❌", mostSevereStatus.statusSeverityDescription];
    }

  }
}


@Injectable()
export class TflApiService {

  constructor(private http: HttpClient, private statusIndicatorService: StatusIndicatorService) {}

  downloadStatus(): Observable<DisplayableLine[]> {
    console.log('foo here');
    return this.http.get<Line[]>('https://api.tfl.gov.uk/Line/Mode/tube/Status').pipe(
      map(data => {
        let lines = data.map(line => {

          let [statusIndicator, description] = this.statusIndicatorService.statusIndicatorFor(line.lineStatuses);
  
          return {
            'id': line.id,
            'name': line.name,
            'statusIndicator': statusIndicator,
            'description': description
          };

        });

        return lines;
      })
    );
  }

}

@Component({
  selector: 'app-tube-status',
  templateUrl: './tube-status.component.html',
  styleUrls: ['./tube-status.component.css'],
  providers: [ StatusIndicatorService, TflApiService ]
})
@Injectable()
export class TubeStatusComponent implements OnInit {

  tubeLines$: Observable<DisplayableLine[]>;

  constructor(private tflApiService: TflApiService) {}

  ngOnInit(): void {
    this.tubeLines$ = this.tflApiService.downloadStatus()
  }

}

interface Line {
  id: string;
  name: string;
  lineStatuses: LineStatus[];
}

interface LineStatus {
  statusSeverity: number;
  statusSeverityDescription: string;
}

interface DisplayableLine {
  id: string;
  statusIndicator: string;
  description: string;
}