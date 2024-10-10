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
    loadChildren: () => import('./MesaAPI/menu-add/menu-add.module').then( m => m.MenuAddPageModule)
  },
  {
    path: 'menu-edit/:id',  // Cambiado para incluir el parámetro 'id'
    loadChildren: () => import('./MesaAPI/menu-edit/menu-edit.module').then( m => m.MenuEditPageModule)
  },
  {
    path: 'menu-delete',
    loadChildren: () => import('./MesaAPI/menu-delete/menu-delete.module').then( m => m.MenuDeletePageModule)
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then( m => m.AdminPageModule)
  },
  {
    path: 'face-id',
    loadChildren: () => import('./face-id/face-id.module').then( m => m.FaceIDPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
