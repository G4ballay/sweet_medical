import { NotificationFactory } from "../../domain/notification.js";
import { INotificationRepository } from "../interfaces/notification.repository.interface.js";
import { NotificationModel } from "./models/notification.model.js";

export class NotificationMongoRepository extends INotificationRepository {

    #toDomain(dbNotification) {
        if (!dbNotification) return null;
        return NotificationFactory.createNotification({
            id: dbNotification._id.toString(),
            recipient: dbNotification.recipient,
            sender: dbNotification.sender,
            message: dbNotification.message,
            createTimestamp: dbNotification.createTimestamp,
            readTimestamp: dbNotification.readTimestamp,
            isRead: dbNotification.isRead,
            deletedAt: dbNotification.deletedAt
        });
    }

    async findById(id) {
        const doc = await NotificationModel.findById(id).lean();
        if (doc && doc.deletedAt) return null;
        return this.#toDomain(doc);
    }

    async findAll({ recipient, isread } = {}) {
        const query = { deletedAt: null };

        if (recipient) query.recipient = recipient;
        if (isread !== undefined) query.isRead = isread;

        const docs = await NotificationModel.find(query).sort({ createTimestamp: -1 }).lean();
        return docs.map(d => this.#toDomain(d));
    }

    async save(notification) {
        const saved = await NotificationModel.create({
            recipient: notification.recipient,
            sender: notification.sender,
            message: notification.message,
            createTimestamp: notification.createTimestamp,
            readTimestamp: notification.readTimestamp,
            isRead: notification.isRead
        });
        return saved._id.toString();
    }

    async update(notificationToUpdate) {
        const { id, ...data } = notificationToUpdate;
        const updated = await NotificationModel.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true }
        ).lean();

        return this.#toDomain(updated);
    }

    async delete(id) {
        const doc = await NotificationModel.findByIdAndUpdate(id, {
            deletedAt: new Date()
        }, { new: true }).lean();
        return this.#toDomain(doc);
    }

    static instance() {
        this._instance ||= new this();
        return this._instance;
    }
}
