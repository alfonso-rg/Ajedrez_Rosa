const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Servir archivos estáticos (el frontend)
app.use(express.static(path.join(__dirname, 'public')));

let players = {}; // Guardar jugadores conectados

io.on('connection', (socket) => {
    console.log('Un usuario se ha conectado: ' + socket.id);

    // Asignar color: El primero es blancas, el segundo negras
    let color = null;
    if (Object.keys(players).length === 0) {
        color = 'white';
        players[socket.id] = color;
    } else if (Object.keys(players).length === 1) {
        color = 'black';
        players[socket.id] = color;
    } else {
        // Espectador (si ya hay 2 jugando)
        socket.emit('spectator', true);
    }

    // Informar al jugador de su color
    socket.emit('playerColor', color);

    // Escuchar movimientos del cliente
    socket.on('move', (moveData) => {
        // Reenviar el movimiento a todos los demás clientes (el oponente)
        socket.broadcast.emit('move', moveData);
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
        delete players[socket.id];
    });
});

server.listen(3000, () => {
    console.log('Servidor escuchando en http://localhost:3000');
});