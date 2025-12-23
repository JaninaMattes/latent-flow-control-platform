import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class LoadingService {

    // Observable data service
    private readonly loadingItem = new BehaviorSubject<boolean>(false);
    isLoading$ = this.loadingItem.asObservable();

    startLoading(): void {
        this.loadingItem.next(true);
    }

    stopLoading(): void {
        this.loadingItem.next(false);
    }
}