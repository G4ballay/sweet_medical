import { Router } from 'express';
import { AuthController } from '../../controllers/auth.controller.js';
import { validateRequest } from '../../middlewares/validate-request.middleware.js';
import { validateLogin } from '../../middlewares/validations/auth.validations.middleware.js';

const authController = new AuthController();
const router = Router();

router.post('/',
    validateLogin(),
    validateRequest,
    (req, res, next) => authController.login(req, res, next)
);

export default router;

/**
 * @swagger
 * /sessions:
 *   post:
 *     summary: Iniciar sesión
 *     description: Crea una sesión autenticada y devuelve un token JWT.
 *     tags:
 *       - Sesiones
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email o nombre de usuario
 *                 example: "paciente1@sweetmedical.com"
 *               password:
 *                 type: string
 *                 example: "Password123"
 *     responses:
 *       200:
 *         description: Sesión creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token
 *                 user:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     role:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *       401:
 *         description: Credenciales inválidas
 */
