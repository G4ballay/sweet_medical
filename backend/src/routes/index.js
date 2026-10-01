import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import appointmentRouter from "./api/appointment.routes.js";
import doctorRouter from "./api/doctor.routes.js";
import healthCheckRouter from "./api/health-check.routes.js";
import healthInsuranceRouter from "./api/health-insurance.routes.js";
import locationRouter from "./api/location.routes.js";
import notificationRouter from "./api/notification.routes.js";
import patientRouter from "./api/patient.routes.js";
import practicesRouter from "./api/practice.routes.js";
import sessionRouter from "./api/session.routes.js";
import specialtyRouter from "./api/specialty.routes.js";
import userRouter from "./api/user.routes.js";

const router = Router();

router.get('/', (req, res) => {
    res.json({ message: "Bienvenido a la API de Sweet Medical" });
});
router.use('/health-check', healthCheckRouter);
router.use('/sessions', sessionRouter);
router.use('/notifications', notificationRouter);
router.use('/users', userRouter);
router.use('/specialties', specialtyRouter);
router.use('/practices', practicesRouter);
router.use('/doctors', doctorRouter);
router.use('/patients', patientRouter);
router.use('/locations', locationRouter);
router.use('/medical-coverages', healthInsuranceRouter);

router.use(authMiddleware);
router.use('/appointments', appointmentRouter);


export default router;