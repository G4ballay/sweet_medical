import jwt from 'jsonwebtoken'
import { Server } from 'socket.io'

const userSockets = new Map()
let io

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: "*" },
  })

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token
    if (!token) return next(new Error('Token requerido'))
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET)
      socket.userId = payload.userId
      next()
    } catch {
      next(new Error('Token inválido'))
    }
  })

  io.on('connection', (socket) => {
    userSockets.set(String(socket.userId), socket.id)
    socket.on('disconnect', () => userSockets.delete(String(socket.userId)))
  })
}

export function notifyUser(userId, data) {
  const socketId = userSockets.get(String(userId))
  if (socketId) io.to(socketId).emit('notification', data)
}