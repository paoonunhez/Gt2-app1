import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// import { Tarea } from '../../clases/tarea.model';
// import { TareaService } from '../../tarea.service';
import { AuthService } from '../../auth.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-iniciar',
  templateUrl: './iniciar.component.html',
  styleUrls: ['./iniciar.component.css']
})
export class IniciarComponent implements OnInit {

  iniciarForm: FormGroup;
  sAuthCookie: Subject<boolean>;

  constructor(
    private authService: AuthService, 
    private fb: FormBuilder, 
    private router: Router
    ) {
    // validaciones del formulario
    this.iniciarForm = this.fb.group({
      email: ['', [
                    Validators.required,
                    Validators.email,
                  ]
            ],
      password:['', Validators.required] 
    });
    // cookie
    this.sAuthCookie = new Subject();
  }

  iniciar(correo, password){
    this.authService
    .iniciar(correo, password)
    .subscribe(data => {
      if(data.estado){
        this.sAuthCookie.next(true); // cookie
        this.authService.establecerAuthCookie(true) //eliminar luego
        this.authService.establecerIdCookie(data.data);
        this.router.navigate(['/lista'])
      } else {
        window.alert(data.data)
      }
    });
  }

  // doLogin(email: string, password: string) {
  //   this.http.post(environment.apiUrl + '/login', {
  //     email: email,
  //     password: password
  //   }, {
  //     withCredentials: true
  //   }).subscribe((resp: any) => {
  //     this.loggedIn.next(true);
  //     this.toastr.success(resp && resp.user && resp.user.name ? `Welcome ${resp.user.name}` : 'Logged in!');
  //   }, (errorResp) => {
  //     this.loggedIn.next(false);
  //     errorResp.error ? this.toastr.error(errorResp.error.errorMessage) : this.toastr.error('An unknown error has occured.');
  //   });
  // }

  ngOnInit() {
  }

}
