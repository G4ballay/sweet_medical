import mongoose from "mongoose";
import { Role } from "../../../enums/role.enum.js";

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: Object.values(Role), required: true },
    deletedAt: { type: Date, default: null }
}, {
    timestamps: true
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return candidatePassword === this.password;
};

export const UserModel = mongoose.model('User', userSchema);
