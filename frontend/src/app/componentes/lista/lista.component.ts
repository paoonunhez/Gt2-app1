import { Component, OnInit, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material';

import { Tarea } from '../../clases/tarea.model';
import { TareaService } from '../../tarea.service';
import { AuthService } from '../../auth.service';
import { Subject } from 'rxjs';


@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.css']
})
@Injectable()
export class ListaComponent implements OnInit {

  // para la tabla
  dTareas: Tarea[]; // datasource
  cabeceraTabla = ['descripcion', 'acciones'];

  sTarea: Subject<Tarea | null>;

  constructor(
    private tareaService: TareaService,
    private authService: AuthService,
    private router: Router
    ) {
      this.sTarea = new Subject();
      this.getAuthCookie();
     }

  getAuthCookie(){
    this.authService.sAuthCookie
    .subscribe(() => {
      this.sTarea.next(null);
    });
  }

  ngOnInit() {
    this.obtenerLista();
  }

  obtenerLista(){
    this.tareaService
      .lista()
      .subscribe((data: Tarea[]) => {
        this.dTareas = data;
      });
  }

  actualizar(id){
    this.router.navigate([`/actualizar/${id}`]);
  }

  eliminar(id){
    this.tareaService
    .eliminar(id)
    .subscribe((data: any) => {
      if(data.estado){
        // this.router.navigate(['/lista'])
        this.obtenerLista();
      } else {
        window.alert('error al eliminar este item')
      }
    });
  }

}
