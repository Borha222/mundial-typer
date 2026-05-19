/**
 * Core Application Controller
 * Bootstraps the application, coordinates routing, handles authentication,
 * and maintains active real-time data subscriptions.
 */

import { AppDB } from './db.js?v=3';
import { UIComponents } from './components.js?v=3';

class App {
  constructor() {
    this.db = new AppDB();
    this.ui = new UIComponents(this);
    this.activeSubscriptionUnsubscribe = null;
    this.currentRoomData = null;
  }

  /**
   * Main bootstrap entry point.
   */
  async initApp() {
    const mainContainer = document.getElementById('app-root');
    if (!mainContainer) return;

    // Clean up any existing active subscription
    this.clearRoomSubscription();

    const username = this.db.getCurrentUser();
    if (!username) {
      // 1. Render Auth Screen if not logged in
      this.ui.renderAuth(mainContainer);
      return;
    }

    const activeRoomCode = this.db.getActiveRoomCode();
    if (!activeRoomCode) {
      // 2. Render Room Selector Screen if no active room is chosen
      mainContainer.innerHTML = `<div class="loading-spinner">Wczytywanie pokoi...</div>`;
      try {
        const rooms = await this.db.getUserRooms();
        this.ui.renderRoomSelector(mainContainer, rooms);
      } catch (error) {
        console.error("Failed to load user rooms:", error);
        mainContainer.innerHTML = `<div class="alert alert-danger">Błąd wczytywania pokoi: ${error.message}</div>`;
      }
      return;
    }

    // 3. Active Room Selected: Setup Real-time Reactive Listener
    mainContainer.innerHTML = `<div class="loading-spinner">Łączenie z pokojem ${activeRoomCode}...</div>`;
    
    try {
      this.activeSubscriptionUnsubscribe = await this.db.subscribeToRoom(
        activeRoomCode,
        (roomData) => {
          this.currentRoomData = roomData;
          
          // Check if dashboard layout has already been rendered.
          // If yes, we only need to re-render the ACTIVE tab's content.
          // This prevents complete layout refreshes and maintains smooth form inputs.
          const dashboardHeader = document.querySelector('.dashboard-header');
          if (dashboardHeader) {
            // Update clock and status inside the header directly
            const clockEl = dashboardHeader.querySelector('.clock-time');
            if (clockEl) {
              clockEl.textContent = this.ui.formatDate(roomData.virtualTime);
            }
            const statusEl = dashboardHeader.querySelector('.clock-status');
            if (statusEl) {
              const isStarted = new Date(roomData.virtualTime) >= new Date('2026-06-11T17:00:00');
              statusEl.innerHTML = isStarted 
                ? '<span class="status-live">● MUNDIAL TRWA</span>' 
                : '<span class="status-waiting">⏱ Przed Mundialem</span>';
            }

            // Update active tab content
            const activeTabButton = document.querySelector('.nav-tab.active');
            if (activeTabButton) {
              const tabName = activeTabButton.getAttribute('data-tab');
              this.ui.renderTabContent(tabName, roomData);
            }
          } else {
            // Initial full render of the dashboard shell
            this.ui.renderRoomDashboard(mainContainer, roomData);
          }
        }
      );
    } catch (error) {
      console.error("Subscription to room failed:", error);
      mainContainer.innerHTML = `
        <div class="alert alert-danger glass-card">
          <h4>Błąd połączenia z pokojem!</h4>
          <p>${error.message}</p>
          <button id="err-back-btn" class="btn btn-secondary mt-3">➔ Powrót do wyboru pokoju</button>
        </div>
      `;
      mainContainer.querySelector('#err-back-btn').addEventListener('click', () => {
        localStorage.removeItem('wc_active_room_code');
        this.initApp();
      });
    }
  }

  /**
   * Safely disposes active room state sync listener to prevent resource leaks.
   */
  clearRoomSubscription() {
    if (this.activeSubscriptionUnsubscribe) {
      try {
        this.activeSubscriptionUnsubscribe();
      } catch (e) {
        console.error("Error cleaning up subscription:", e);
      }
      this.activeSubscriptionUnsubscribe = null;
    }
    this.currentRoomData = null;
  }
}

// Bootstrap once the DOM content is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  window.app = app; // Expose globally for testing/debugging
  app.initApp();
});
