import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QrService } from '../../services/qr-generator/qr.service';
import { ClMesero } from '../../services/qr-generator/model/ClMesero';
import { SQLiteService } from '../../services/sqlite/sqlite.service';

@Component({
  selector: 'app-mesero-edit',
  templateUrl: './mesero-edit.page.html',
  styleUrls: ['./mesero-edit.page.scss'],
})
export class MeseroEditPage implements OnInit {
  mesero: ClMesero | null = null;

  constructor(
    private qrService: QrService,
    private route: ActivatedRoute,
    private router: Router,
    private sqliteService: SQLiteService
  ) {}

  ngOnInit() {
    
    const id = this.route.snapshot.params['id'];
    this.qrService.getMeseroById(id).subscribe((data: ClMesero) => {
      this.mesero = data;
    });
  }

  async onSubmit() {
    if (this.mesero) {
      this.qrService.updateMesero(this.mesero).subscribe(() => {
        this.router.navigate(['/meseros']);
      });
    }
  }

  cancel() {
    this.router.navigate(['/meseros']);
  }
}
