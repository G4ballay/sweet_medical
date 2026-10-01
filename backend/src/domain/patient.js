export class Patient {
    constructor({ id, userId, documentNumber, name, healthInsuranceId, planId }) {
        this.id = id;
        this.userId = userId;
        this.documentNumber = documentNumber;
        this.name = name;
        this.healthInsuranceId = healthInsuranceId;
        this.planId = planId;
    }
}

