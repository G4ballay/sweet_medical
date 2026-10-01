import mongoose from "mongoose";
import dns from "node:dns/promises";

export const connectDB = async () => {
    const dbType = (process.env.DB_TYPE || 'MEMORY').toUpperCase();

    switch (dbType) {
        case 'MONGO':
            try {
                dns.setServers(["1.1.1.1", "1.0.0.1"]);
                await mongoose.connect(process.env.MONGODB_URI);
                console.log('Connected to DATABASE (MongoDB)');
            } catch (error) {
                console.error('DATABASE connection error', error.message);
                process.exit(1);
            }
            break;
        case 'MEMORY':
        default:
            console.log(`Using IN-MEMORY database.`);
            break;
    }
};
