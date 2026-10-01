import api from "./api";

export function getNotifications() {
  return api.get('/notifications').then(r => r.data);
}

export function markNotificationAsRead(id) {
  return api.patch(`/notifications/${id}`, { isRead: true }).then(r => r.data);
}

export function deleteNotification(id) {
  return api.delete(`/notifications/${id}`).then(r => r.data);
}
