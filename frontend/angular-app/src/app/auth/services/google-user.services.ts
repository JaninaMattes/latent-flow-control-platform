import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { IGoogleAuthUser } from "src/app/models/google-auth-user.model";

@Injectable({
    providedIn: 'root'
})
export class GoogleUserService {
  private readonly userSubject = new BehaviorSubject<IGoogleAuthUser | null>(null);
  user$ = this.userSubject.asObservable();

  public setUser(user: IGoogleAuthUser | null) {
    this.userSubject.next(user);
  }

  public get currentUser(): IGoogleAuthUser | null {
    return this.userSubject.value;
  }
}