import { NotificationFactory } from "../domain/notification.js";
import { NotFoundError } from "../errors/domain.errors.js";
import { RepositoryFactory } from "../factories/repository.factory.js";
import { UserService } from "./user.service.js";
import { notifyUser } from "../socket/index.js";

export class NotificationService {
  constructor({
    notificationRepository = RepositoryFactory.getNotificationRepository(),
    userService = new UserService()
  } = {}) {
    this.notificationRepository = notificationRepository;
    this.userService = userService;
  }

  async create(notifData) {
    await this.userService.findById(notifData.recipient);
    if (notifData.sender)
      await this.userService.findById(notifData.sender);

    const notification = NotificationFactory.createNotification(notifData, notifData.type);
    const savedId = await this.notificationRepository.save(notification);

    notifyUser(notifData.recipient, {
      id: savedId,
      recipient: notifData.recipient,
      sender: notifData.sender || 'SYSTEM',
      message: notifData.message,
      isRead: false,
      createTimestamp: new Date(),
      readTimestamp: null,
    });

    return savedId;
  }

  async findAll(filters) {
    return this.notificationRepository.findAll(filters);
  }

  async findById(id) {
    const notification = await this.notificationRepository.findById(id);
    if (!notification) throw new NotFoundError("Notificación", id);
    return notification;
  }

  async delete(id) {
    const notification = await this.findById(id);
    notification.deletedAt = new Date();
    return this.notificationRepository.update(notification);
  }

  async patch(notifData) {
    const notification = await this.findById(notifData.id);
    if (notifData.isRead === true) {
      notification.markAsRead();
      return this.notificationRepository.update(notification);
    }
    const updatedNotification = { ...notification, ...notifData };
    return this.notificationRepository.update(updatedNotification);
  }
}