import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router 
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
// import { map } from 'rxjs/operators';

// este creo que se puede eliminar
// import { TareaService } from './tarea.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    // private tareaService: TareaService, // este tambien se puede eliminar
    private router: Router) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    // debugger
    if(!this.authService.obtenerEstadoInicioSesion){
      this.router.navigate(['/iniciar']);
      return false
    }
    // return this.tareaService.obtenerEstadoInicioSesion()
    // .pipe(map(res => {
    //   if (res.estado){
    //     this.auth.establecerAuthCookie(true)
    //     return true
    //   } else {
    //     this.router.navigate(['/iniciar'])
    //     return false
    //   }
    // }))
    return this.authService.obtenerEstadoInicioSesion;

  }
}
