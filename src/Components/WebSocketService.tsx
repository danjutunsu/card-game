let socket: WebSocket;

export function initializeWebSocket(userId: string) {
    const socket = new WebSocket(`wss://triviafriendsserver.onrender.com/?userId=${userId}`)

// Add event listeners and handle WebSocket events here

return socket;
}

export function getWebSocket() {
return socket;
}