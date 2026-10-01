import { IBaseRepository } from "./base.repository.interface.js";

export class IServiceRepository extends IBaseRepository { 
    getOptions(){{ throw new Error("getOptions() no implementado"); }}
}