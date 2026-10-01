export class Location {
    constructor({ id, name, street, number, city, state }) {
        this.id = id;
        this.name = name;
        this.street = street;
        this.number = number;
        this.city = city;
        this.state = state;
    }

    get fullAddress() {
        return `${this.street} ${this.number}, ${this.city}, ${this.state}`;
    }
}