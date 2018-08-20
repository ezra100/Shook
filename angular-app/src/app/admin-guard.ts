import {Injectable} from '@angular/core';
import {CanActivate} from '@angular/router';
import {AuthService} from './auth.service';
import { UserType } from '../../../types';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate() {
    return AuthService.currentUser && AuthService.currentUser.userType === UserType.Admin;
  }
}