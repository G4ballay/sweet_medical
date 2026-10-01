export class IBaseRepository {
    findById(id) { throw new Error("findById() no implementado"); }
    findAll(filters, orderBy, orderDir) { throw new Error("findAll() no implementado"); }
    save(entity) { throw new Error("save() no implementado"); }
    update(idOrEntity, data) { throw new Error("update() no implementado"); }
    delete(id) { throw new Error("delete() no implementado"); }
    exists(filters) { throw new Error("exists() no implementado"); }
}
