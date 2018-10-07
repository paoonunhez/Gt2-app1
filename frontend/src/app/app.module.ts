import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
// import { CookieService } from 'ngx-cookie-service';

// Material
import {
  MatToolbarModule,
  MatInputModule,
  MatFormFieldModule,
  MatButtonModule,
  MatTableModule
} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Componentes
import { AppComponent } from './app.component';
import { IniciarComponent } from './componentes/iniciar/iniciar.component';
import { ListaComponent } from './componentes/lista/lista.component';
import { NuevoComponent } from './componentes/nuevo/nuevo.component';
import { ActualizarComponent } from './componentes/actualizar/actualizar.component';
import { CerrarComponent } from './componentes/cerrar/cerrar.component';

// Servicios
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { TareaService } from './tarea.service';



const routes: Routes = [
  { path: 'iniciar', component: IniciarComponent},
  { 
    path: 'lista', 
    component: ListaComponent, 
    canActivate:[AuthGuard]
  },
  { 
    path: 'cerrar', 
    component: CerrarComponent, 
    canActivate:[AuthGuard]
  },
  { path: 'nuevo', component: NuevoComponent},
  { path: 'actualizar/:id', component: ActualizarComponent},
  { path: '', redirectTo: 'iniciar', pathMatch: 'full'}
];

@NgModule({
  declarations: [
    AppComponent,
    IniciarComponent,
    ListaComponent,
    NuevoComponent,
    ActualizarComponent,
    CerrarComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatTableModule
  ],
  providers: [AuthService, AuthGuard, TareaService],
  bootstrap: [AppComponent]
})
export class AppModule { }
