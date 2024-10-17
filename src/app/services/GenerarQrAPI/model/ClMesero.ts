export class ClMesero {
    private static lastId: number = 0; // Variable estática para llevar el conteo del último ID asignado

    id: number;
    nombre: string;
    qrCode: string;
    texto: string;
    fecha: Date;

    constructor(obj: any) {
        // Asignar un nuevo ID si no se proporciona uno
        if (obj && obj.id) {
            this.id = obj.id; // Mantener el id si se proporciona
        } else {
            this.id = ++ClMesero.lastId; // Incrementar antes de asignar
        }

        this.nombre = obj && obj.nombre || null;
        this.qrCode = obj && obj.qrCode || null;
        this.texto = obj && obj.texto || null;
        this.fecha = obj && obj.fecha || new Date(); // Asignar fecha actual si no se proporciona
    }
}
