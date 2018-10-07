import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../auth.service';
import { Subject } from 'rxjs';


@Component({
  selector: 'app-cerrar',
  templateUrl: './cerrar.component.html',
  styleUrls: ['./cerrar.component.css']
})
export class CerrarComponent implements OnInit {

  sCerrar: Subject<boolean>;

  constructor(
    private authService: AuthService,
    private router: Router
   
  ) {
  
    this.sCerrar = new Subject();
  }

  ngOnInit() {
    this.cerrar()
    
  }

  cerrar(){    
    this.authService
    .cerrar()
    .subscribe(data =>{
      if(data.estado){
        
        this.router.navigate(['/iniciar'])
        this.sCerrar.next(false);
        
      } else {
        window.alert('Error al cerrar session!!')
      }
    });
  }
  
}
