import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tarea } from './clases/tarea.model';
import { Subject } from 'rxjs';

interface miResp {
  estado: boolean,
  data: string
}

@Injectable({
  providedIn: 'root'
})
export class TareaService {

  url = 'http://localhost:3000';
  sAuthCookie: Subject<boolean>;

  constructor(private http:HttpClient) {
    this.sAuthCookie = new Subject();
    this.getLogin(); // para probar
  }

  getLogin() {
    this.http.get(
      `${this.url}/api/authCookie`,  // url
      { withCredentials: true }      // cookie , important
      )
      .subscribe((resp: any) => {
          this.sAuthCookie.next(resp.estado);
        }, (errorResp) => {
          // this.toastr.error('Oops, something went wrong getting the logged in status')
      })
  }

  // obtener la lista
  lista(){
    return this.http.get(
      `${this.url}/api/item/lista`, // url
      { withCredentials: true }     // cookie
      );
  }

  // obtener un item
  getItem(id){
    return this.http.get(
      `${this.url}/api/item/${id}`, // url
      { withCredentials: true }     // cookie
      );
  }

  // crear nuevo item
  nuevo(descripcion, idusuario){
    const item = {
      descripcion: descripcion,
      idusuario: idusuario
    };

    return this.http.post<miResp>(
      `${this.url}/api/item/nuevo`, // url
      item,                         // data
      { withCredentials: true }     // cookie
      );
  }

  // actualizar
  actualizar(descripcion, id){
    const item = {
      descripcion: descripcion
    };

    return this.http.post<miResp>(
      `${this.url}/api/item/actualizar/${id}`, // url
      item,                                    // data
      { withCredentials: true }                // cookie
      );
  }

  // eliminar
  eliminar(id){
    const item = {
    };
    return this.http.post<miResp>(
      `${this.url}/api/item/eliminar/${id}`, // url
      item,                                  // data
      { withCredentials: true }              // cookie
      );
  }
}
