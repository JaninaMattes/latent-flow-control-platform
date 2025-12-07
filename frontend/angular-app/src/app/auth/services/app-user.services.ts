import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { IAppAuthUser } from "src/app/models/spotify-auth-user.model";

@Injectable({
    providedIn: 'root'
})
export class AppUserService {
    public loggedInUser: BehaviorSubject<IAppAuthUser> = new BehaviorSubject<any>({});
}