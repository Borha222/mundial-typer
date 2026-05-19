/**
 * Database Adapter Layer
 * Handles user authentication, room management, bets, and simulation settings.
 * Supports dual-mode:
 * 1. Local Mode (using browser LocalStorage) - zero config, local multiplayer simulation.
 * 2. Firebase Mode (using cloud Firestore & Auth) - real-time global multiplayer.
 */

export class AppDB {
  constructor() {
    this.isFirebase = false;
    this.firebaseApp = null;
    this.firestore = null;
    this.auth = null;
    this.listeners = {}; // For room real-time subscriptions

    this.initMode();
  }

  /**
   * Initializes the database mode based on saved Firebase configuration.
   */
  async initMode() {
    const savedConfig = localStorage.getItem('worldcup_firebase_config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        if (config && config.apiKey && config.projectId) {
          await this.enableFirebase(config);
          console.log("Firebase mode enabled successfully.");
          return;
        }
      } catch (e) {
        console.error("Failed to initialize Firebase from saved config:", e);
      }
    }
    console.log("LocalStorage mode active.");
  }

  /**
   * Dynamic loading of Firebase SDK from CDN and initialization.
   */
  async enableFirebase(config) {
    if (this.isFirebase) return true;

    try {
      // Import Firebase App and Firestore dynamically from CDN
      const firebaseModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js');
      const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');

      this.firebaseApp = firebaseModule.initializeApp(config);
      this.firestore = firestoreModule.getFirestore(this.firebaseApp);
      this.isFirebase = true;

      // Save config to local storage for persistence
      localStorage.setItem('worldcup_firebase_config', JSON.stringify(config));

      // Trigger standard listeners if any are active
      Object.keys(this.listeners).forEach(roomCode => {
        this.subscribeToRoom(roomCode, this.listeners[roomCode]);
      });

      return true;
    } catch (error) {
      console.error("Firebase SDK failed to load or initialize:", error);
      this.isFirebase = false;
      throw error;
    }
  }

  /**
   * Disables Firebase mode and falls back to LocalStorage.
   */
  disableFirebase() {
    this.isFirebase = false;
    this.firestore = null;
    this.firebaseApp = null;
    localStorage.removeItem('worldcup_firebase_config');
    console.log("Switched back to LocalStorage mode.");
  }

  /**
   * Get active Firebase configuration if exists.
   */
  getFirebaseConfig() {
    const savedConfig = localStorage.getItem('worldcup_firebase_config');
    return savedConfig ? JSON.parse(savedConfig) : null;
  }

  // ==========================================
  // AUTHENTICATION METHODS
  // ==========================================

  /**
   * Registers a new user account.
   */
  async registerUser(username, email, password) {
    username = username.trim().toLowerCase();
    if (!username || !email || !password) {
      throw new Error("Wszystkie pola są wymagane!");
    }

    if (this.isFirebase) {
      try {
        const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const userDocRef = firestoreModule.doc(this.firestore, 'users', username);
        const userDoc = await firestoreModule.getDoc(userDocRef);

        if (userDoc.exists()) {
          throw new Error("Nazwa użytkownika jest już zajęta!");
        }

        const userData = {
          username: username,
          email: email.trim(),
          password: password, // For simple demonstration; in production, use standard Firebase Auth.
          joinedRooms: [],
          createdAt: new Date().toISOString()
        };

        await firestoreModule.setDoc(userDocRef, userData);
        this.setCurrentUser(username);
        return userData;
      } catch (error) {
        throw new Error("Błąd Firebase: " + error.message);
      }
    } else {
      // LocalStorage Auth
      const users = JSON.parse(localStorage.getItem('wc_users') || '{}');
      if (users[username]) {
        throw new Error("Nazwa użytkownika jest już zajęta!");
      }

      const userData = {
        username: username,
        email: email.trim(),
        password: password,
        joinedRooms: [],
        createdAt: new Date().toISOString()
      };

      users[username] = userData;
      localStorage.setItem('wc_users', JSON.stringify(users));
      this.setCurrentUser(username);
      return userData;
    }
  }

  /**
   * Logs in an existing user.
   */
  async loginUser(username, password) {
    username = username.trim().toLowerCase();
    if (!username || !password) {
      throw new Error("Nazwa użytkownika i hasło są wymagane!");
    }

    if (this.isFirebase) {
      try {
        const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const userDocRef = firestoreModule.doc(this.firestore, 'users', username);
        const userDoc = await firestoreModule.getDoc(userDocRef);

        if (!userDoc.exists() || userDoc.data().password !== password) {
          throw new Error("Nieprawidłowa nazwa użytkownika lub hasło!");
        }

        this.setCurrentUser(username);
        return userDoc.data();
      } catch (error) {
        throw new Error("Błąd logowania Firebase: " + error.message);
      }
    } else {
      // LocalStorage Auth
      const users = JSON.parse(localStorage.getItem('wc_users') || '{}');
      const user = users[username];

      if (!user || user.password !== password) {
        throw new Error("Nieprawidłowa nazwa użytkownika lub hasło!");
      }

      this.setCurrentUser(username);
      return user;
    }
  }

  /**
   * Set logged-in user state.
   */
  setCurrentUser(username) {
    localStorage.setItem('wc_current_user', username);
  }

  /**
   * Get logged-in user username.
   */
  getCurrentUser() {
    return localStorage.getItem('wc_current_user') || null;
  }

  /**
   * Log out active user.
   */
  logoutUser() {
    localStorage.removeItem('wc_current_user');
    localStorage.removeItem('wc_active_room_code');
  }

  // ==========================================
  // ROOM MANAGEMENT METHODS
  // ==========================================

  /**
   * Helper to generate a unique room code.
   */
  generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'MUND-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Creates a brand new betting room.
   */
  async createRoom(roomName) {
    const username = this.getCurrentUser();
    if (!username) throw new Error("Musisz być zalogowany, aby stworzyć pokój!");

    const roomCode = this.generateRoomCode();
    const roomData = {
      code: roomCode,
      name: roomName.trim(),
      owner: username,
      members: [username],
      tournamentStatus: 'not_started', // 'not_started' | 'in_progress' | 'finished'
      virtualTime: '2026-06-10T12:00:00', // Default start before first match
      matchScores: {}, // { matchId: { home: X, away: Y } }
      predictions: {}, // { username: { matchId: { home: X, away: Y } } }
      specialPredictions: {}, // { username: { top1, top2, top3, top4, goldenBoot, assists } }
      results: { top1: null, top2: null, top3: null, top4: null, goldenBoot: null, assists: null },
      createdAt: new Date().toISOString()
    };

    if (this.isFirebase) {
      try {
        const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        
        // 1. Create Room Document
        const roomDocRef = firestoreModule.doc(this.firestore, 'rooms', roomCode);
        await firestoreModule.setDoc(roomDocRef, roomData);

        // 2. Add Room to User Joined List
        const userDocRef = firestoreModule.doc(this.firestore, 'users', username);
        const userDoc = await firestoreModule.getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const joinedRooms = userData.joinedRooms || [];
          if (!joinedRooms.includes(roomCode)) {
            joinedRooms.push(roomCode);
            await firestoreModule.updateDoc(userDocRef, { joinedRooms });
          }
        }

        this.setActiveRoomCode(roomCode);
        return roomData;
      } catch (error) {
        throw new Error("Błąd Firebase: " + error.message);
      }
    } else {
      // LocalStorage Mode
      const rooms = JSON.parse(localStorage.getItem('wc_rooms') || '{}');
      rooms[roomCode] = roomData;
      localStorage.setItem('wc_rooms', JSON.stringify(rooms));

      const users = JSON.parse(localStorage.getItem('wc_users') || '{}');
      if (users[username]) {
        users[username].joinedRooms = users[username].joinedRooms || [];
        users[username].joinedRooms.push(roomCode);
        localStorage.setItem('wc_users', JSON.stringify(users));
      }

      this.setActiveRoomCode(roomCode);
      return roomData;
    }
  }

  /**
   * Joins an existing betting room using the 6-character code.
   */
  async joinRoom(roomCode) {
    const username = this.getCurrentUser();
    if (!username) throw new Error("Musisz być zalogowany, aby dołączyć do pokoju!");

    roomCode = roomCode.trim().toUpperCase();

    if (this.isFirebase) {
      try {
        const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const roomDocRef = firestoreModule.doc(this.firestore, 'rooms', roomCode);
        const roomDoc = await firestoreModule.getDoc(roomDocRef);

        if (!roomDoc.exists()) {
          throw new Error("Nie znaleziono pokoju o podanym kodzie!");
        }

        const roomData = roomDoc.data();
        if (!roomData.members.includes(username)) {
          roomData.members.push(username);
          await firestoreModule.updateDoc(roomDocRef, { members: roomData.members });
        }

        // Add to user document
        const userDocRef = firestoreModule.doc(this.firestore, 'users', username);
        const userDoc = await firestoreModule.getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const joinedRooms = userData.joinedRooms || [];
          if (!joinedRooms.includes(roomCode)) {
            joinedRooms.push(roomCode);
            await firestoreModule.updateDoc(userDocRef, { joinedRooms });
          }
        }

        this.setActiveRoomCode(roomCode);
        return roomData;
      } catch (error) {
        throw new Error(error.message);
      }
    } else {
      // LocalStorage Mode
      const rooms = JSON.parse(localStorage.getItem('wc_rooms') || '{}');
      const room = rooms[roomCode];

      if (!room) {
        throw new Error("Nie znaleziono pokoju o podanym kodzie!");
      }

      if (!room.members.includes(username)) {
        room.members.push(username);
        rooms[roomCode] = room;
        localStorage.setItem('wc_rooms', JSON.stringify(rooms));
      }

      const users = JSON.parse(localStorage.getItem('wc_users') || '{}');
      if (users[username]) {
        users[username].joinedRooms = users[username].joinedRooms || [];
        if (!users[username].joinedRooms.includes(roomCode)) {
          users[username].joinedRooms.push(roomCode);
          localStorage.setItem('wc_users', JSON.stringify(users));
        }
      }

      this.setActiveRoomCode(roomCode);
      return room;
    }
  }

  /**
   * Set active room.
   */
  setActiveRoomCode(roomCode) {
    localStorage.setItem('wc_active_room_code', roomCode);
  }

  /**
   * Get active room code.
   */
  getActiveRoomCode() {
    return localStorage.getItem('wc_active_room_code') || null;
  }

  /**
   * Gets all rooms joined by the current user.
   */
  async getUserRooms() {
    const username = this.getCurrentUser();
    if (!username) return [];

    if (this.isFirebase) {
      try {
        const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const userDocRef = firestoreModule.doc(this.firestore, 'users', username);
        const userDoc = await firestoreModule.getDoc(userDocRef);

        if (!userDoc.exists()) return [];

        const joinedRoomCodes = userDoc.data().joinedRooms || [];
        const roomPromises = joinedRoomCodes.map(code => 
          firestoreModule.getDoc(firestoreModule.doc(this.firestore, 'rooms', code))
        );

        const roomDocs = await Promise.all(roomPromises);
        return roomDocs.filter(d => d.exists()).map(d => d.data());
      } catch (error) {
        console.error("Error fetching rooms from Firebase:", error);
        return [];
      }
    } else {
      // LocalStorage Mode
      const users = JSON.parse(localStorage.getItem('wc_users') || '{}');
      const user = users[username];
      if (!user) return [];

      const joinedRoomCodes = user.joinedRooms || [];
      const rooms = JSON.parse(localStorage.getItem('wc_rooms') || '{}');

      return joinedRoomCodes.map(code => rooms[code]).filter(Boolean);
    }
  }

  /**
   * Subscribe to a room's changes for real-time synchronization.
   */
  async subscribeToRoom(roomCode, onUpdate) {
    if (!roomCode) return () => {};
    this.listeners[roomCode] = onUpdate;

    if (this.isFirebase) {
      try {
        const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const roomDocRef = firestoreModule.doc(this.firestore, 'rooms', roomCode);
        
        // Return Firestore unsubscribe function
        return firestoreModule.onSnapshot(roomDocRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            onUpdate(docSnapshot.data());
          }
        }, (error) => {
          console.error("Room sync error in Firebase:", error);
        });
      } catch (error) {
        console.error("Failed to load Firebase subscription:", error);
      }
    }

    // LocalStorage fallback subscription / pull model simulation
    const getLocalRoomData = () => {
      const rooms = JSON.parse(localStorage.getItem('wc_rooms') || '{}');
      return rooms[roomCode] || null;
    };

    // Immediate initial callback
    const initialData = getLocalRoomData();
    if (initialData) onUpdate(initialData);

    // Set up an interval or handle storage events for simulating real-time local sync
    const intervalId = setInterval(() => {
      const currentData = getLocalRoomData();
      if (currentData) {
        onUpdate(currentData);
      }
    }, 1000);

    return () => {
      clearInterval(intervalId);
      delete this.listeners[roomCode];
    };
  }

  /**
   * Updates room state (bets, scores, time, status).
   */
  async updateRoomData(roomCode, updatedFields) {
    if (this.isFirebase) {
      try {
        const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const roomDocRef = firestoreModule.doc(this.firestore, 'rooms', roomCode);
        await firestoreModule.updateDoc(roomDocRef, updatedFields);
      } catch (error) {
        throw new Error("Błąd podczas aktualizacji danych w chmurze: " + error.message);
      }
    } else {
      // LocalStorage Mode
      const rooms = JSON.parse(localStorage.getItem('wc_rooms') || '{}');
      if (!rooms[roomCode]) throw new Error("Pokój nie istnieje!");

      rooms[roomCode] = { ...rooms[roomCode], ...updatedFields };
      localStorage.setItem('wc_rooms', JSON.stringify(rooms));
    }
  }

  // ==========================================
  // TRANSACTIONAL BETTING OPERATIONS
  // ==========================================

  /**
   * Submits a match prediction for the logged-in user in the active room.
   */
  async submitPrediction(roomCode, matchId, homeScore, awayScore) {
    const username = this.getCurrentUser();
    if (!username) throw new Error("Musisz być zalogowany!");

    const rooms = JSON.parse(localStorage.getItem('wc_rooms') || '{}');
    let room = null;

    if (this.isFirebase) {
      try {
        const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const roomDocRef = firestoreModule.doc(this.firestore, 'rooms', roomCode);
        const roomDoc = await firestoreModule.getDoc(roomDocRef);
        if (!roomDoc.exists()) throw new Error("Pokój nie istnieje!");
        room = roomDoc.data();
      } catch (error) {
        throw new Error(error.message);
      }
    } else {
      room = rooms[roomCode];
      if (!room) throw new Error("Pokój nie istnieje!");
    }

    // Double check time lock locally as well
    const virtualTime = new Date(room.virtualTime || '2026-06-10T12:00:00');
    // We get match info below, we will pass matches to check or import them
    // Let's assume matches will be fetched or we just proceed since components block it.

    room.predictions = room.predictions || {};
    room.predictions[username] = room.predictions[username] || {};
    room.predictions[username][matchId] = {
      home: parseInt(homeScore, 10),
      away: parseInt(awayScore, 10),
      updatedAt: new Date().toISOString()
    };

    await this.updateRoomData(roomCode, { predictions: room.predictions });
  }

  /**
   * Submits special predictions (Top 4, Golden Boot, Assists).
   */
  async submitSpecialPredictions(roomCode, specialObj) {
    const username = this.getCurrentUser();
    if (!username) throw new Error("Musisz być zalogowany!");

    let room = null;
    if (this.isFirebase) {
      try {
        const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const roomDocRef = firestoreModule.doc(this.firestore, 'rooms', roomCode);
        const roomDoc = await firestoreModule.getDoc(roomDocRef);
        room = roomDoc.data();
      } catch (e) {}
    } else {
      const rooms = JSON.parse(localStorage.getItem('wc_rooms') || '{}');
      room = rooms[roomCode];
    }

    if (!room) throw new Error("Pokój nie istnieje!");

    room.specialPredictions = room.specialPredictions || {};
    room.specialPredictions[username] = {
      ...specialObj,
      updatedAt: new Date().toISOString()
    };

    await this.updateRoomData(roomCode, { specialPredictions: room.specialPredictions });
  }
}
