import { LocationService } from "../services/location.service.js";
import { matchedData } from "express-validator";

export class LocationController {

    constructor({ locationService = new LocationService()} = {}) {
        this.locationService = locationService;
    }

    async getAll(_req, res, next) {
        return this.locationService.getAll()
            .then(locations => res.status(200).json(locations))
            .catch(next);
    }

    async getById(req, res, next) {
        const { id } = matchedData(req);
        return this.locationService.getById(id)
            .then(location => res.status(200).json(location))
            .catch(next);
    }

    async create(req, res, next) {
        const locationData = matchedData(req);
        return this.locationService.create(locationData)
            .then(locationId => res.status(201).json({ id: locationId }))
            .catch(next);
    }

    async update(req, res, next) {
        const locationData = matchedData(req);
        return this.locationService.update(locationData)
            .then(location => res.status(200).json(location))
            .catch(next);
    }

    async delete(req, res, next) {
        const { id } = matchedData(req);
        return this.locationService.delete(id)
            .then(deletedLocation => res.status(204).json({ location: deletedLocation }))
            .catch(next);
    }
}