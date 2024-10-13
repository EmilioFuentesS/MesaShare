import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'registrar',
    loadChildren: () => import('./registrar/registrar.module').then( m => m.RegistrarPageModule)
  },
  {
    path: 'recuperar',
    loadChildren: () => import('./recuperar/recuperar.module').then( m => m.RecuperarPageModule)
  },
  {
    path: 'inicio',
    loadChildren: () => import('./inicio/inicio.module').then( m => m.InicioPageModule)
  },
  {
    path: 'menu-add',
    loadChildren: () => import('./services/MesaAPI/menu-add/menu-add.module').then( m => m.MenuAddPageModule)
  },
 
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then( m => m.AdminPageModule)
  },
  {
    path: 'credencial-admin',
    loadChildren: () => import('./credencial-admin/credencial-admin.module').then( m => m.CredencialAdminPageModule)
  },
  {
    path: 'qr-generator',
    loadChildren: () => import('./services/qr-generator/qr-generator.module').then( m => m.QrGeneratorPageModule)
  },
  {
    path: 'meseros',
    loadChildren: () => import('./meseros/meseros.module').then( m => m.MeserosPageModule)
  },
  {
    path: 'mesero-edit',
    loadChildren: () => import('./meseros/mesero-edit/mesero-edit.module').then( m => m.MeseroEditPageModule)
  },
  {
    path: 'mesero-edit/:id', // Asegúrate de que el segmento ':id' está presente para capturar el parámetro del ID
    loadChildren: () => import('./meseros/mesero-edit/mesero-edit.module').then(m => m.MeseroEditPageModule)
  }
  

 

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
