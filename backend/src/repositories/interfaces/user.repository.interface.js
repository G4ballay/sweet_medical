import { IBaseRepository } from "./base.repository.interface.js";

export class IUserRepository extends IBaseRepository { 
    findByEmail(email){ throw new Error("findByEmail() no implementado");}
    findByUsername(username){ throw new Error("findByUsername() no implementado");}
    findByIdentifier(identifier){ throw new Error("findByIdentifier() no implementado");}
}
