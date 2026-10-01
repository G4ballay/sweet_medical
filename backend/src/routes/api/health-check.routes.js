import { Router } from "express";
import { HealthCheckController } from "../../controllers/health-check.controller.js";

const healthCheckController = new HealthCheckController();

const router = Router();

router.route('/')
    .get((req, res, next) => healthCheckController.heartBeat(req, res, next));

export default router;