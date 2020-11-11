import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  data: any = [];
  title = 'demo';

  constructor(private http: HttpClient) {}

  getData() {
    const url = 'http://localhost:8080/v1/api';
    this.http.get(url).subscribe((res) => {
      this.data = res;
      console.log(this.data);
    });
  }
}
