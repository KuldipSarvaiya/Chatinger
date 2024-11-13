class ActiveUsersManager {
  constructor() {
    this.activeUsers = new Map();
    this.waitingUsers = new Set();
  }

  addUser(socketId, peerId) {
    this.activeUsers.set(socketId, {
      peerId,
      status: 'available',
      roomId: null
    });
    this.waitingUsers.add(socketId);
  }

  removeUser(socketId) {
    const user = this.activeUsers.get(socketId);
    if (user) {
      this.waitingUsers.delete(socketId);
      this.activeUsers.delete(socketId);
      return user.roomId; // Return roomId if user was in a call
    }
    return null;
  }

  findMatch(socketId) {
    const currentUser = this.activeUsers.get(socketId);
    if (!currentUser || currentUser.status !== 'available') return null;

    // Find another available user
    for (const waitingSocketId of this.waitingUsers) {
      if (waitingSocketId !== socketId) {
        const potentialMatch = this.activeUsers.get(waitingSocketId);
        if (potentialMatch && potentialMatch.status === 'available') {
          return waitingSocketId;
        }
      }
    }
    return null;
  }

  createRoom(socket1Id, socket2Id) {
    const roomId = `room_${Math.random().toString(36).substr(2, 9)}`;
    
    // Update both users
    const user1 = this.activeUsers.get(socket1Id);
    const user2 = this.activeUsers.get(socket2Id);
    
    if (user1 && user2) {
      user1.status = 'busy';
      user1.roomId = roomId;
      user2.status = 'busy';
      user2.roomId = roomId;
      
      // Remove from waiting list
      this.waitingUsers.delete(socket1Id);
      this.waitingUsers.delete(socket2Id);
      
      return {
        roomId,
        user1: { socketId: socket1Id, peerId: user1.peerId },
        user2: { socketId: socket2Id, peerId: user2.peerId }
      };
    }
    return null;
  }

  makeUserAvailable(socketId) {
    const user = this.activeUsers.get(socketId);
    if (user) {
      user.status = 'available';
      user.roomId = null;
      this.waitingUsers.add(socketId);
    }
  }

  getActiveUsersCount() {
    return this.activeUsers.size;
  }

  getWaitingUsersCount() {
    return this.waitingUsers.size;
  }
}

export default ActiveUsersManager
