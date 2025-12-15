import io from 'socket.io-client';
import type { Socket } from 'socket.io-client';

// Socket.io 配置
const SOCKET_URL = process.env.SOCKET_URL || 
    (process.env.NODE_ENV === 'production' 
        ? `${window.location.origin}/im/user`
        : 'http://localhost:30916/im/user');

const SOCKET_OPTIONS = {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    autoConnect: false, // 手动控制连接时机
};

let socket: Socket | null = null;

/**
 * 初始化 Socket 连接
 */
export function initSocket(): Socket {
    if (!socket) {
        socket = io(SOCKET_URL, SOCKET_OPTIONS);
        
        socket.on('connect', () => {
            console.log('Socket connected:', socket?.id);
        });
        
        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });
        
        socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
        });
    }
    return socket;
}

/**
 * 获取 Socket 实例
 */
export function getSocket(): Socket | null {
    return socket;
}

/**
 * 断开 Socket 连接
 */
export function disconnectSocket(): void {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}

export default initSocket;
