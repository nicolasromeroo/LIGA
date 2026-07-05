import { io } from "socket.io-client";
import { API_URL } from "./client";

// Crea una conexión socket.io autenticada con el nombre/usuario.
// El backend lee socket.handshake.auth.{name,userId}.
export const createSocket = ({ name, userId } = {}) =>
    io(API_URL, {
        transports: ["websocket", "polling"],
        auth: { name, userId },
    });
