import { NotificationType } from "../enums/notification-type.enum.js"
export class NotificationFactory {
    
    static createNotification(data, type = NotificationType.PLATFORM) {

        switch(type) {

            case NotificationType.PLATFORM: 
                return new PlatformNotification(data);

            default:
                throw new Error('Invalid notification type');

        }
    }

}

class Notification {

    constructor({ id, recipient, sender = "SYSTEM", message, createTimestamp = new Date(), readTimestamp = null, isRead = false, deletedAt = null}) {

        if (this.constructor === Notification) {
            throw new Error('Abstract class cannot be instantiated');
        }

        this.id = id;
        this.recipient = recipient;
        this.sender = sender;
        this.message = message;

        this.createTimestamp = createTimestamp;
        this.readTimestamp = readTimestamp;

        this.isRead = isRead;

        this.deletedAt = deletedAt;
    }

    markAsRead() {
        this.isRead = true;
        this.readTimestamp = new Date();
    }
}

class PlatformNotification extends Notification {
    constructor(data) {
        super(data);
    }
}