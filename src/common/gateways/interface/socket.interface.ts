import { Socket as DefaultSocket } from 'socket.io';

export interface Socket extends DefaultSocket {
  user?: {
    sub: number;
    email: string;
  };
}
