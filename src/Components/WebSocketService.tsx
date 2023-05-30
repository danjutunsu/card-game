let socket: WebSocket;

export function initializeWebSocket(userId: string) {
socket = new WebSocket(`wss://triviafriends.herokuapp.com?userId=${userId}`);

// Add event listeners and handle WebSocket events here

return socket;
}

export function getWebSocket() {
return socket;
}