import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { IGoogleAuthUser } from "src/app/models/google-auth-user.model";

@Injectable({
    providedIn: 'root'
})
export class GoogleUserService {
    public loggedInUser: BehaviorSubject<IGoogleAuthUser> = new BehaviorSubject<any>({});
}