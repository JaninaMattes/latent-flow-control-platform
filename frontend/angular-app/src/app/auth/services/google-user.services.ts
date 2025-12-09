import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";


@Injectable({
    providedIn: 'root'
})
export class GoogleUserService {
    public loggedInUser: BehaviorSubject<IGoogleAuthUser> = new BehaviorSubject<any>({});
}