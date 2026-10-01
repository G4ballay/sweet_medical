import { NotificationFactory } from "../../domain/notification.js";
import { IdUtils } from "../../utils/id.utils.js";
import { INotificationRepository } from "../interfaces/notification.repository.interface.js";

export class NotificationMemoryRepository extends INotificationRepository {
    constructor() {
        super();
        this.notifications = [
            NotificationFactory.createNotification({
                id: "600000000000000000000091",
                recipient: "600000000000000000000012",
                sender: "600000000000000000000001",
                message: "Necesito un turno médico para una operación",
                createTimestamp: new Date(),
                readTimestamp: new Date(),
                isRead: true
            }),
            NotificationFactory.createNotification({
                id: "600000000000000000000092",
                recipient: "600000000000000000000001",
                sender: "600000000000000000000012",
                message: "Tenés que pedirlo por ventanilla",
                createTimestamp: new Date(),
                readTimestamp: null,
                isRead: false
            })
        ];
    }

    save(notification) {
        if (!notification.id)
            notification.id = IdUtils.generateId();
        this.notifications.push(notification)
        return notification.id;
    }

    findAll({ recipient, isread } = {}) {
        return this.notifications.filter(notification => {
            if (recipient && notification.recipient !== recipient) return false;
            if (isread !== undefined && notification.isRead !== isread) return false;
            return !notification.deletedAt;
        }).sort((a, b) => b.createTimestamp - a.createTimestamp);
    }

    findById(id) {
        return this.notifications.find(notification => notification.id === id && !notification.deletedAt) || null
    }

    update(notificationToUpdate) {
        const index = this.notifications.findIndex(notification => notification.id === notificationToUpdate.id);
        if (index === -1) return null;
        this.notifications[index] = notificationToUpdate;
        return notificationToUpdate;
    }

    static instance() {
        this._instance ||= new this();
        return this._instance;
    }
}