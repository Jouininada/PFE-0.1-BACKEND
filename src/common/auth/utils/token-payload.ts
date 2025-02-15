import { Socket } from 'socket.io';

export function getTokenPayload(request: any) {
  const authorization = request.headers['authorization'];
  if (authorization && authorization.startsWith('Bearer ')) {
    const payload = JSON.parse(atob(authorization.split('.')[1]));
    return payload;
  }
  return null;
}

export function getTokenPayloadForWebSocket(socket: Socket) {
  const authorization = socket?.handshake?.headers.authorization;
  if (authorization && authorization.startsWith('Bearer ')) {
    const payload = JSON.parse(atob(authorization.split('.')[1]));
    return payload;
  }
  return null;
}
