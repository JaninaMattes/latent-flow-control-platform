import { Component, OnInit } from '@angular/core';
import { LoadingService } from '../../services/spinner-loader.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.sass']
})
export class FooterComponent implements OnInit {

  isLoading$: Observable<boolean>;

  constructor(private readonly loadingService: LoadingService) { 
    this.isLoading$ = this.loadingService.isLoading$;
  }

  ngOnInit(): void {
  }

}
