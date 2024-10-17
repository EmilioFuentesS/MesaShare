export class ClUser {
    private static lastId: number = 0;

    id: number;
    username: string;
    email: string;
    password: string;
    active: number;
    fechaRegistro: Date;

    constructor(obj: any) {
        if (obj && obj.id) {
            this.id = obj.id;
        } else {
            this.id = ++ClUser.lastId;
        }

        this.username = obj && obj.username || null;
        this.email = obj && obj.email || null;
        this.password = obj && obj.password || null;
        this.active = obj && obj.active !== undefined ? obj.active : 0; // No activo por defecto
        this.fechaRegistro = obj && obj.fechaRegistro || new Date();
    }
}
