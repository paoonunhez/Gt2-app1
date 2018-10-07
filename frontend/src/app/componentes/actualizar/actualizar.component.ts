import { Component, OnInit, Injectable } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router'; 

import { Tarea } from '../../clases/tarea.model';
import { TareaService } from '../../tarea.service';
import { AuthService } from '../../auth.service';
import { Subject } from 'rxjs';


@Component({
  selector: 'app-actualizar',
  templateUrl: './actualizar.component.html',
  styleUrls: ['./actualizar.component.css']
})
@Injectable()
export class ActualizarComponent implements OnInit {

  actualizarForm: FormGroup;
  sTarea: Subject<Tarea | null>;

  tarea: Tarea;

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private route: ActivatedRoute, 
    private tareaService: TareaService,
    private authService: AuthService
    ) {

    this.actualizarForm = this.fb.group({
      descripcion: ['', Validators.required]
    });

    this.sTarea = new Subject();
    // this.tarea = new Tarea();
    this.getAuthCookie();
  }

  getAuthCookie(){
    this.authService.sAuthCookie
    .subscribe(() => {
      this.sTarea.next(null);
    });
  }

  actualizar(descripcion) {
    this.tareaService
    .actualizar(descripcion, this.tarea.id)
    .subscribe( data => {
      if(data){
        // this.sAuthCookie.next(true); // cookie
        // this.authService.establecerAuthCookie(true) //eliminar luego
        this.router.navigate(['/lista'])
      } else {
        window.alert(data)
      }
    });
    // this.router.navigate(['/lista']);
  }

  ngOnInit() {
    this.route.params.subscribe( params => {
      const id = Number(params.id)
      this.tareaService.getItem(id).subscribe((data: Tarea) =>{
        this.tarea = data
        this.actualizarForm.get('descripcion').setValue(this.tarea.descripcion);
      });
    });
    
  }

}
