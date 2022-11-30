const socket = io();
function sendPacket(pktName, pkt) {
    socket.emit(pktName, pkt)
}