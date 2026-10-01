import { matchedData } from "express-validator";
import { NotificationService } from "../services/notification.service.js";

export class NotificationController {
    constructor({ notificationService = new NotificationService() } = {}) {
        this.notificationService = notificationService;
    }

    async create(req, res, next) {
        const notifData = matchedData(req);
        return this.notificationService.create(notifData)
            .then(notification => res.status(201).json(notification))
            .catch(next);
    }

    async findAll(req, res, next) {
        const filters = matchedData(req);
    
        filters.recipient = req.user.userId;
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
        
        return this.notificationService.findAll(filters)
            .then(notifications => res.status(200).json(notifications))
            .catch(next)
    }

    async findById(req, res, next) {
        const { id } = matchedData(req);
        return this.notificationService.findById(id)
            .then(notification => res.status(200).json(notification))
            .catch(next);
    }

    async patch(req, res, next) {
        const notifData = matchedData(req);
        return this.notificationService.patch(notifData)
            .then(notification => res.status(200).json(notification))
            .catch(next);
    }

    async delete(req, res, next) {
        const { id } = matchedData(req);
        return this.notificationService.delete(id)
            .then(notification => res.status(204).json(notification))
            .catch(next);
    }
}