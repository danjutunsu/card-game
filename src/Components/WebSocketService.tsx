let socket: WebSocket;

export function initializeWebSocket() {
const socket = new WebSocket(`wss://triviafriends.herokuapp.com`);

// Add event listeners and handle WebSocket events here

return socket;
}

export function getWebSocket() {
return socket;
}