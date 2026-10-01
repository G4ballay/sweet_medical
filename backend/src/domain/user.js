export class User {
    constructor({ id, username, email, password, role }) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    async comparePassword(candidatePassword) {
        return candidatePassword === this.password;
    }
}