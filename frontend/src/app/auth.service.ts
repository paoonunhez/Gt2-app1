import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs';

interface miResp {
  estado: boolean,
  data: number
}

// interface estadoInicioSesion {
//   estado: boolean
// }

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  url = 'http://localhost:3000';
  sAuthCookie: Subject<boolean>;

  constructor(private http: HttpClient) { 
    this.sAuthCookie = new Subject();
    this.getLogin(); // para probar
  }

  private estadoSesion = JSON.parse(localStorage.getItem('authCookie') || 'false')
  private idSesion = JSON.parse(localStorage.getItem('idCookie') || '-1')

  establecerAuthCookie(value: boolean){
    this.estadoSesion = value
    localStorage.setItem('authCookie', `${value}`)
  }

  establecerIdCookie(value: Number){
    this.idSesion = value
    localStorage.setItem('idCookie', `${value}`)
  }

  get obtenerEstadoInicioSesion(){
    return JSON.parse(localStorage.getItem('authCookie') || this.estadoSesion.toString())
  }
  get obtenerIdSesion(){
    return JSON.parse(localStorage.getItem('idCookie') || this.idSesion.toString())
  }

  iniciar(usuario, password){
    const credenciales = {
      usuario: usuario,
      password: password
    };
    return this.http.post<miResp>(
      `${this.url}/api/iniciar`, // url
      credenciales,              // data
      { withCredentials: true })  // cookie
  }

  getLogin() {
    this.http.get(
      `${this.url}/api/authCookie`,  // url
      { withCredentials: true })      // cookie , important
      .subscribe((resp: any) => {
          this.sAuthCookie.next(resp.estado);
        }, (errorResp) => {
          // this.toastr.error('Oops, something went wrong getting the logged in status')
      })
  }

  cerrar(){
      localStorage.removeItem('authCookie');
      localStorage.removeItem('idCookie');
      return this.http.get<miResp>(
        `${this.url}/api/cerrar`,
        { withCredentials: true }      // cookie , important
        );
  }


}
