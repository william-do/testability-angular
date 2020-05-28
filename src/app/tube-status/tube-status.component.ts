import { Component, OnInit } from '@angular/core';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-tube-status',
  templateUrl: './tube-status.component.html',
  styleUrls: ['./tube-status.component.css']
})
@Injectable()
export class TubeStatusComponent implements OnInit {

  tubeLines$: Observable<object[]>;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {

    this.tubeLines$ = this.http.get<Line[]>('https://api.tfl.gov.uk/Line/Mode/tube/Status').pipe(
      map(data => {
        let lines = data.map(line => {

          let [statusIndicator, description] = this.statusIndicatorFor(line.lineStatuses);
  
          return {
            'id': line.id,
            'statusIndicator': statusIndicator,
            'description': description
          };
          
        });

        return lines;
      })
    );
  }

  statusIndicatorFor(lineStatuses: LineStatus[]): [string, string] {

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

interface Line {
  id: string;
  lineStatuses: LineStatus[];
}

interface LineStatus {
  statusSeverity: number;
  statusSeverityDescription: string;
}
