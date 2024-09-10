import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { AnimationController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements AfterViewInit {

  @ViewChild('animatedImage', { read: ElementRef, static: true }) animatedImage!: ElementRef;

  constructor(private animationCtrl: AnimationController) {}

  ngAfterViewInit() {
    this.playAnimation();
  }

  playAnimation() {
    const imageAnimation = this.animationCtrl.create()
      .addElement(this.animatedImage.nativeElement)
      .duration(3000) // Duración de la animación
      .easing('ease-in-out') // Curva de aceleración/desaceleración suave
      .fromTo('opacity', 0, 1) // Efecto de fade-in
      .fromTo('transform', 'scale(0.8) rotate(0deg)', 'scale(1) rotate(360deg)'); // Efecto de escala + rotación completa
  
    imageAnimation.play();
  }
  
  
}
