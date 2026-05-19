/**
 * UI Components Renderer
 * Creates and renders dynamic views for the application.
 * Note: Variable names and code are in English, but user-facing text is in Polish.
 */

import { TEAMS, PLAYERS, MATCHES, findTeamById, getTeamFlagHtml } from './matches.js?v=3';
import { calculateRoomLeaderboard, calculateMatchPoints } from './scoring.js?v=3';

export class UIComponents {
  constructor(app) {
    this.app = app;
    this.expandedUsers = new Set();
  }

  /**
   * Helper to format Date to Polish format (DD.MM.YYYY, HH:MM).
   */
  formatDate(dateStr) {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  }

  // ==========================================
  // VIEW RENDERERS
  // ==========================================

  /**
   * Renders the Authentication screen (Login / Register).
   */
  renderAuth(container) {
    container.innerHTML = `
      <div class="auth-card glass">
        <div class="auth-header">
          <div class="trophy-bounce">🏆</div>
          <h1>Mundial Typer</h1>
          <p>Typuj wyniki meczów ze znajomymi o punkty!</p>
        </div>
        
        <div class="auth-tabs">
          <button id="tab-login-btn" class="auth-tab active">Logowanie</button>
          <button id="tab-register-btn" class="auth-tab">Rejestracja</button>
        </div>

        <form id="auth-login-form" class="auth-form">
          <div class="form-group">
            <label for="login-username">Nazwa użytkownika</label>
            <input type="text" id="login-username" required placeholder="np. jankowalski" autocomplete="username">
          </div>
          <div class="form-group">
            <label for="login-password">Hasło</label>
            <input type="password" id="login-password" required placeholder="••••••••" autocomplete="current-password">
          </div>
          <button type="submit" class="btn btn-primary btn-block">Zaloguj się</button>
        </form>

        <form id="auth-register-form" class="auth-form hidden">
          <div class="form-group">
            <label for="register-username">Nazwa użytkownika</label>
            <input type="text" id="register-username" required placeholder="np. jankowalski" autocomplete="username">
            <small class="form-hint">Tylko małe litery i cyfry, bez spacji.</small>
          </div>
          <div class="form-group">
            <label for="register-email">Adres e-mail</label>
            <input type="email" id="register-email" required placeholder="np. jan@example.com" autocomplete="email">
          </div>
          <div class="form-group">
            <label for="register-password">Hasło</label>
            <input type="password" id="register-password" required placeholder="Min. 6 znaków" autocomplete="new-password">
          </div>
          <button type="submit" class="btn btn-primary btn-block">Utwórz konto</button>
        </form>

        <div id="auth-error" class="alert alert-danger hidden"></div>
      </div>
    `;

    // Auth events toggle
    const loginBtn = container.querySelector('#tab-login-btn');
    const registerBtn = container.querySelector('#tab-register-btn');
    const loginForm = container.querySelector('#auth-login-form');
    const registerForm = container.querySelector('#auth-register-form');
    const errorAlert = container.querySelector('#auth-error');

    loginBtn.addEventListener('click', () => {
      loginBtn.classList.add('active');
      registerBtn.classList.remove('active');
      loginForm.classList.remove('hidden');
      registerForm.classList.add('hidden');
      errorAlert.classList.add('hidden');
    });

    registerBtn.addEventListener('click', () => {
      registerBtn.classList.add('active');
      loginBtn.classList.remove('active');
      registerForm.classList.remove('hidden');
      loginForm.classList.add('hidden');
      errorAlert.classList.add('hidden');
    });

    // Login submit
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorAlert.classList.add('hidden');
      const u = loginForm.querySelector('#login-username').value;
      const p = loginForm.querySelector('#login-password').value;
      try {
        await this.app.db.loginUser(u, p);
        this.app.initApp();
      } catch (err) {
        errorAlert.textContent = err.message;
        errorAlert.classList.remove('hidden');
      }
    });

    // Register submit
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorAlert.classList.add('hidden');
      const u = registerForm.querySelector('#register-username').value;
      const m = registerForm.querySelector('#register-email').value;
      const p = registerForm.querySelector('#register-password').value;
      
      if (!/^[a-z0-9_]+$/.test(u)) {
        errorAlert.textContent = "Nazwa użytkownika może zawierać tylko małe litery, cyfry i podkreślniki!";
        errorAlert.classList.remove('hidden');
        return;
      }
      if (p.length < 6) {
        errorAlert.textContent = "Hasło musi mieć minimum 6 znaków!";
        errorAlert.classList.remove('hidden');
        return;
      }

      try {
        await this.app.db.registerUser(u, m, p);
        this.app.initApp();
      } catch (err) {
        errorAlert.textContent = err.message;
        errorAlert.classList.remove('hidden');
      }
    });
  }

  /**
   * Renders Room Selector view (if no active room is chosen).
   */
  renderRoomSelector(container, rooms) {
    const username = this.app.db.getCurrentUser();
    
    let roomsHtml = '';
    if (rooms.length === 0) {
      roomsHtml = `
        <div class="empty-state">
          <p>Nie należysz jeszcze do żadnego pokoju.</p>
          <p class="subtext">Stwórz nową ligę lub wpisz kod od znajomego, aby zacząć typować!</p>
        </div>
      `;
    } else {
      roomsHtml = `
        <div class="rooms-grid">
          ${rooms.map(room => `
            <div class="room-card glass hover-lift" data-code="${room.code}">
              <div class="room-card-header">
                <h3>${room.name}</h3>
                <span class="badge badge-indigo">${room.code}</span>
              </div>
              <div class="room-card-body">
                <p>👤 Właściciel: <strong>${room.owner}</strong></p>
                <p>👥 Gracze: <strong>${room.members.length}</strong></p>
                <p>🏆 Status: <span class="badge ${room.tournamentStatus === 'finished' ? 'badge-danger' : (room.tournamentStatus === 'in_progress' ? 'badge-success' : 'badge-secondary')}">
                  ${room.tournamentStatus === 'finished' ? 'Zakończony' : (room.tournamentStatus === 'in_progress' ? 'W trakcie' : 'Oczekujący')}
                </span></p>
              </div>
              <button class="btn btn-secondary btn-block room-enter-btn" data-code="${room.code}">Wejdź do gry ➔</button>
            </div>
          `).join('')}
        </div>
      `;
    }

    container.innerHTML = `
      <div class="room-selector-container">
        <div class="user-welcome-header glass">
          <div>
            <h1>Cześć, <span class="text-neon-cyan">${username}</span>! 👋</h1>
            <p>Witaj w panelu Mundial Typera. Wybierz swoją ligę lub stwórz nową.</p>
          </div>
          <button id="logout-btn" class="btn btn-outline-danger">Wyloguj się</button>
        </div>

        <div class="actions-row">
          <div class="action-card glass">
            <h2>Stwórz nowy pokój</h2>
            <p>Będziesz Administratorem tej ligi, wygenerujesz kod i zaprosisz znajomych.</p>
            <form id="create-room-form">
              <div class="form-group">
                <input type="text" id="create-room-name" required placeholder="np. Ekipa z pracy ⚽">
              </div>
              <button type="submit" class="btn btn-success btn-block">Stwórz i wejdź</button>
            </form>
          </div>

          <div class="action-card glass">
            <h2>Dołącz do pokoju</h2>
            <p>Wpisz 6-znakowy unikalny kod podany przez znajomego hosta.</p>
            <form id="join-room-form">
              <div class="form-group">
                <input type="text" id="join-room-code" required placeholder="np. MUND-A3X9" maxLength="9">
              </div>
              <button type="submit" class="btn btn-cyan btn-block">Dołącz do gry</button>
            </form>
          </div>
        </div>

        <div class="my-rooms-section">
          <h2>Twoje aktywne pokoje rywalizacji</h2>
          ${roomsHtml}
        </div>

        <div id="room-error" class="alert alert-danger hidden"></div>
      </div>
    `;

    // Logout event
    container.querySelector('#logout-btn').addEventListener('click', () => {
      this.app.db.logoutUser();
      this.app.initApp();
    });

    const errorAlert = container.querySelector('#room-error');

    // Create room event
    container.querySelector('#create-room-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      errorAlert.classList.add('hidden');
      const name = container.querySelector('#create-room-name').value;
      try {
        await this.app.db.createRoom(name);
        this.app.initApp();
      } catch (err) {
        errorAlert.textContent = err.message;
        errorAlert.classList.remove('hidden');
      }
    });

    // Join room event
    container.querySelector('#join-room-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      errorAlert.classList.add('hidden');
      const code = container.querySelector('#join-room-code').value;
      try {
        await this.app.db.joinRoom(code);
        this.app.initApp();
      } catch (err) {
        errorAlert.textContent = err.message;
        errorAlert.classList.remove('hidden');
      }
    });

    // Room card enter buttons
    container.querySelectorAll('.room-enter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.getAttribute('data-code');
        this.app.db.setActiveRoomCode(code);
        this.app.initApp();
      });
    });
  }

  /**
   * Renders the primary Room Dashboard SPA Layout.
   */
  renderRoomDashboard(container, room) {
    const currentUser = this.app.db.getCurrentUser();
    const isOwner = room.owner === currentUser;
    const virtualTime = new Date(room.virtualTime || '2026-06-10T12:00:00');
    
    // Check if tournament has started based on first match time (2026-06-11 17:00)
    const isStarted = virtualTime >= new Date('2026-06-11T17:00:00');

    container.innerHTML = `
      <div class="dashboard-wrapper">
        <header class="dashboard-header glass">
          <div class="header-main">
            <button id="dashboard-back-btn" class="btn btn-sm btn-outline-secondary">➔ Wybierz pokój</button>
            <div class="room-title-info">
              <h2>${room.name} <span class="room-code-badge">${room.code}</span></h2>
              <span class="subtext">Właściciel pokoju: <strong>${room.owner}</strong></span>
            </div>
          </div>
          
          <div class="header-status-bar">
            <div class="virtual-clock-widget glass">
              <div class="clock-label">WIRTUALNY CZAS</div>
              <div class="clock-time pulse">${this.formatDate(room.virtualTime)}</div>
              <div class="clock-status">
                ${isStarted ? '<span class="status-live">● MUNDIAL TRWA</span>' : '<span class="status-waiting">⏱ Przed Mundialem</span>'}
              </div>
            </div>
            <div class="user-badge glass">
              <span>Profil: <strong>${currentUser}</strong></span>
            </div>
          </div>
        </header>

        <nav class="dashboard-tabs glass">
          <button class="nav-tab active" data-tab="tab-leaderboard">🏆 Tabela Liderów</button>
          <button class="nav-tab" data-tab="tab-matches">⚽ Typuj Mecze</button>
          <button class="nav-tab" data-tab="tab-special">🔮 Typy Długoterminowe</button>
          ${isOwner ? `<button class="nav-tab tab-accent" data-tab="tab-admin">🛠 Panel Admina (Host)</button>` : ''}
        </nav>

        <main id="tab-content-container" class="tab-content">
          <!-- Dynamic tab content will render here -->
        </main>
      </div>
    `;

    // Bind back button
    container.querySelector('#dashboard-back-btn').addEventListener('click', () => {
      localStorage.removeItem('wc_active_room_code');
      this.app.initApp();
    });

    // Tab switcher
    const tabs = container.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const tabName = tab.getAttribute('data-tab');
        this.renderTabContent(tabName, room);
      });
    });

    // Default tab
    this.renderTabContent('tab-leaderboard', room);
  }

  /**
   * Routes the tab name to the corresponding sub-renderer.
   */
  renderTabContent(tabName, room) {
    const contentContainer = document.getElementById('tab-content-container');
    if (!contentContainer) return;

    if (tabName === 'tab-leaderboard') {
      this.renderTabLeaderboard(contentContainer, room);
    } else if (tabName === 'tab-matches') {
      this.renderTabMatches(contentContainer, room);
    } else if (tabName === 'tab-special') {
      this.renderTabSpecial(contentContainer, room);
    } else if (tabName === 'tab-admin') {
      this.renderTabAdmin(contentContainer, room);
    }
  }

  /**
   * Tab 1: Leaderboard Component
   */
  renderTabLeaderboard(container, room) {
    const rankings = calculateRoomLeaderboard(room);
    const currentUser = this.app.db.getCurrentUser();
    const virtualTime = new Date(room.virtualTime || '2026-06-10T12:00:00');

    let rankingsHtml = '';
    if (rankings.length === 0) {
      rankingsHtml = `<tr><td colspan="7" class="text-center">Brak graczy w pokoju. Zaproś znajomych podając kod: ${room.code}</td></tr>`;
    } else {
      rankingsHtml = rankings.map((user, index) => {
        let medal = '';
        if (index === 0) medal = '🥇';
        else if (index === 1) medal = '🥈';
        else if (index === 2) medal = '🥉';
        else medal = `${index + 1}.`;

        const isMe = user.username === currentUser;

        const isExpanded = this.expandedUsers && this.expandedUsers.has(user.username);
        return `
          <tr class="leaderboard-row ${isMe ? 'row-highlight' : ''}" data-username="${user.username}">
            <td class="text-center font-bold rank-cell">${medal}</td>
            <td class="username-cell"><strong>${user.username}</strong> ${isMe ? '<span class="badge badge-cyan">TY</span>' : ''}</td>
            <td class="text-center points-cell">${user.totalPoints} pkt</td>
            <td class="text-center text-success">${user.exactCount} x 5pkt</td>
            <td class="text-center text-cyan">${user.outcomeCount} x 3pkt</td>
            <td class="text-center text-purple">${user.specialPoints} pkt</td>
            <td class="text-center"><button class="btn btn-sm btn-outline-cyan view-bets-btn" data-user="${user.username}">${isExpanded ? 'Zwiń ▴' : 'Szczegóły 🔍'}</button></td>
          </tr>
          <tr id="bets-detail-${user.username}" class="bets-detail-row ${isExpanded ? '' : 'hidden'} glass">
            <td colspan="7">
              <div class="bets-detail-expanded">
                <h4>Szczegóły typów gracza <span class="text-neon-cyan">${user.username}</span>:</h4>
                
                <div class="expanded-grid">
                  <div class="expanded-column">
                    <h5>⚽ Typy na mecze:</h5>
                    <div class="bets-compact-list">
                      ${MATCHES.map(match => {
                        const pred = (room.predictions[user.username] || {})[match.id];
                        const act = room.matchScores[match.id];
                        const isMatchLocked = virtualTime >= new Date(match.startTime);
                        
                        let predText = 'Brak typu';
                        if (pred) predText = `${pred.home} - ${pred.away}`;

                        let actText = '-';
                        if (act && act.home !== undefined) actText = `${act.home} - ${act.away}`;

                        let pointsAwarded = '';
                        if (act && pred) {
                          const pts = calculateMatchPoints(pred, act);
                          pointsAwarded = pts > 0 ? `<span class="badge ${pts === 5 ? 'badge-success' : 'badge-cyan'}">+${pts} pkt</span>` : `<span class="badge badge-secondary">0 pkt</span>`;
                        }

                        // Hide prediction of OTHER users if match is not locked yet
                        if (!isMatchLocked && user.username !== currentUser) {
                          predText = '🔒 Ukryty do meczu';
                          pointsAwarded = '';
                        }

                        return `
                          <div class="bet-compact-item">
                            <span class="match-teams-compact">${getTeamFlagHtml(match.home)} ${match.homeName} vs ${getTeamFlagHtml(match.away)} ${match.awayName}</span>
                            <span class="match-pred-compact">Typ: <strong>${predText}</strong></span>
                            <span class="match-act-compact">Wynik: <strong>${actText}</strong></span>
                            ${pointsAwarded}
                          </div>
                        `;
                      }).join('')}
                    </div>
                  </div>

                  <div class="expanded-column">
                    <h5>🔮 Typy długoterminowe:</h5>
                    <div class="special-compact-list">
                      ${(() => {
                        const sp = room.specialPredictions[user.username] || {};
                        const res = room.results || {};
                        const isSpecLocked = virtualTime >= new Date('2026-06-11T17:00:00');

                        const renderSpecItem = (label, predVal, resVal, score) => {
                          let displayPred = predVal || 'Brak typu';
                          
                          if (!isSpecLocked && user.username !== currentUser) {
                            displayPred = '🔒 Ukryty do Mundialu';
                          }

                          let resultBadge = '';
                          if (resVal && predVal) {
                            resultBadge = predVal === resVal ? `<span class="badge badge-success">+${score} pkt</span>` : `<span class="badge badge-secondary">0 pkt</span>`;
                          }

                          return `
                            <div class="spec-compact-item">
                              <span class="spec-label">${label}:</span>
                              <span class="spec-value"><strong>${displayPred}</strong></span>
                              ${resVal ? `<span class="spec-actual">Wynik: ${resVal}</span>` : ''}
                              ${resultBadge}
                            </div>
                          `;
                        };

                        const getTeamNameAndFlag = (id) => {
                          if (!id) return '';
                          const t = findTeamById(id);
                          return t ? `${getTeamFlagHtml(t.id)} ${t.name}` : id;
                        };

                        return `
                          ${renderSpecItem('🏆 Top 1 (Mistrz)', getTeamNameAndFlag(sp.top1), getTeamNameAndFlag(res.top1), 10)}
                          ${renderSpecItem('🥈 Top 2 (Wicemistrz)', getTeamNameAndFlag(sp.top2), getTeamNameAndFlag(res.top2), 8)}
                          ${renderSpecItem('🥉 Top 3', getTeamNameAndFlag(sp.top3), getTeamNameAndFlag(res.top3), 6)}
                          ${renderSpecItem('🏅 Top 4', getTeamNameAndFlag(sp.top4), getTeamNameAndFlag(res.top4), 4)}
                          ${renderSpecItem('👟 Król Strzelców', sp.goldenBoot, res.goldenBoot, 10)}
                          ${renderSpecItem('🅰️ Najwięcej Asyst', sp.assists, res.assists, 10)}
                        `;
                      })()}
                    </div>
                  </div>
                </div>

              </div>
            </td>
          </tr>
        `;
      }).join('');
    }

    container.innerHTML = `
      <div class="leaderboard-container glass-card">
        <div class="tab-section-header">
          <h3>🏆 Tabela Liderów Pokoju</h3>
          <p>Kliknij wiersz lub "Szczegóły", aby zobaczyć dokładne typy poszczególnych graczy. Typy przeciwników są ukryte do czasu rozpoczęcia meczów/Mundialu!</p>
        </div>

        <div class="table-responsive">
          <table class="leaderboard-table">
            <thead>
              <tr>
                <th class="text-center" style="width: 70px;">Poz.</th>
                <th>Gracz</th>
                <th class="text-center" style="width: 120px;">Suma pkt</th>
                <th class="text-center" style="width: 120px;">Dokładne</th>
                <th class="text-center" style="width: 120px;">Rozstrzygnięte</th>
                <th class="text-center" style="width: 120px;">Dodatkowe</th>
                <th class="text-center" style="width: 120px;">Akcja</th>
              </tr>
            </thead>
            <tbody>
              ${rankingsHtml}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Row expansion events
    container.querySelectorAll('.view-bets-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const username = btn.getAttribute('data-user');
        const detailRow = container.querySelector(`#bets-detail-${username}`);
        if (detailRow.classList.contains('hidden')) {
          detailRow.classList.remove('hidden');
          btn.textContent = 'Zwiń ▴';
          this.expandedUsers.add(username);
        } else {
          detailRow.classList.add('hidden');
          btn.textContent = 'Szczegóły 🔍';
          this.expandedUsers.delete(username);
        }
      });
    });
  }

  /**
   * Tab 2: Match Predictions Component
   */
  renderTabMatches(container, room) {
    const currentUser = this.app.db.getCurrentUser();
    const virtualTime = new Date(room.virtualTime || '2026-06-10T12:00:00');
    const userPredictions = room.predictions[currentUser] || {};
    const matchScores = room.matchScores || {};

    const matchesHtml = MATCHES.map(match => {
      const matchTime = new Date(match.startTime);
      const isLocked = virtualTime >= matchTime;
      const pred = userPredictions[match.id];
      const actualScore = matchScores[match.id];

      // Formulate active inputs or static displays
      let actionArea = '';
      let statusBadge = '';
      let pointsBadge = '';

      if (isLocked) {
        // MATCH IS LOCKED
        statusBadge = `<span class="badge badge-danger">🔒 Zablokowany (Mecz ruszył)</span>`;
        
        let predictionText = '<span class="text-muted">Brak typu</span>';
        if (pred) {
          predictionText = `<span class="score-display">${pred.home} - ${pred.away}</span>`;
        }

        let actualText = '<span class="text-muted">Mecz w grze / Brak wyniku</span>';
        if (actualScore && actualScore.home !== undefined) {
          actualText = `<span class="score-display text-neon-cyan">${actualScore.home} - ${actualScore.away}</span>`;
          
          if (pred) {
            const pts = calculateMatchPoints(pred, actualScore);
            if (pts === 5) {
              pointsBadge = `<div class="points-reward reward-success">+5 pkt <br><small>Dokładny wynik</small></div>`;
            } else if (pts === 3) {
              pointsBadge = `<div class="points-reward reward-cyan">+3 pkt <br><small>Poprawny zwycięzca</small></div>`;
            } else {
              pointsBadge = `<div class="points-reward reward-secondary">0 pkt <br><small>Pudło</small></div>`;
            }
          }
        }

        actionArea = `
          <div class="locked-bet-container">
            <div class="result-box">
              <span class="label">Twój typ:</span>
              <strong>${predictionText}</strong>
            </div>
            <div class="result-box">
              <span class="label">Wynik meczu:</span>
              <strong>${actualText}</strong>
            </div>
          </div>
        `;
      } else {
        // MATCH IS OPEN FOR BETTING
        statusBadge = `<span class="badge badge-success">🔓 Otwarty do typowania</span>`;
        
        const homeVal = pred ? pred.home : '';
        const awayVal = pred ? pred.away : '';

        actionArea = `
          <form class="match-bet-form" data-match-id="${match.id}">
            <div class="bet-inputs">
              <input type="number" class="score-input home-score" min="0" max="99" required value="${homeVal}" placeholder="0" id="input-${match.id}-home">
              <span class="score-separator">:</span>
              <input type="number" class="score-input away-score" min="0" max="99" required value="${awayVal}" placeholder="0" id="input-${match.id}-away">
            </div>
            <button type="submit" class="btn btn-cyan btn-sm btn-bet-save">Zapisz typ</button>
          </form>
          <div class="saved-bet-info">
            <span class="label">Zapisany typ:</span>
            <span class="value">${pred ? `${pred.home} - ${pred.away}` : '<span class="text-warning">brak ❌</span>'}</span>
          </div>
        `;
      }

      // Filter out the current user to get other players (friends)
      const friends = (room.members || []).filter(member => member !== currentUser);

      const friendsBetsHtml = friends.length === 0
        ? '<div class="friends-bets-empty">Brak innych znajomych w tym pokoju.</div>'
        : `<div class="friends-bets-list">
            ${friends.map(friend => {
              const fPred = (room.predictions[friend] || {})[match.id];
              let statusText = '';
              let statusClass = '';

              if (fPred) {
                statusText = `${fPred.home} - ${fPred.away}`;
                statusClass = isLocked ? 'friend-bet-scored' : 'friend-bet-saved';
              } else {
                statusText = 'nie obstawiono ❌';
                statusClass = 'friend-bet-empty';
              }

              return `
                <div class="friend-bet-item ${statusClass}">
                  <span class="friend-name">${friend}</span>
                  <span class="friend-status">${statusText}</span>
                </div>
              `;
            }).join('')}
          </div>`;

      return `
        <div class="match-card glass-card hover-lift">
          <div class="match-card-header">
            <span class="match-stage">${match.stage}</span>
            <span class="match-time">⏱ ${this.formatDate(match.startTime)}</span>
            ${statusBadge}
          </div>
          
          <div class="match-card-body">
            <div class="teams-container">
              <div class="team team-home">
                <span class="flag-giant">${getTeamFlagHtml(match.home)}</span>
                <span class="team-name">${match.homeName}</span>
              </div>
              
              <div class="vs-badge">VS</div>
              
              <div class="team team-away">
                <span class="flag-giant">${getTeamFlagHtml(match.away)}</span>
                <span class="team-name">${match.awayName}</span>
              </div>
            </div>
            
            <div class="match-card-action">
              ${actionArea}
            </div>

            ${pointsBadge}

            <div class="friends-bets-section">
              <div class="friends-bets-title">Typy znajomych:</div>
              ${friendsBetsHtml}
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="matches-tab-container">
        <div class="tab-section-header glass-card">
          <h3>⚽ Typuj Wyniki Spotkań</h3>
          <p>Możesz swobodnie zmieniać swoje typy aż do oficjalnej godziny rozpoczęcia poszczególnych spotkań. Dokładny wynik to <strong>5 punktów</strong>, a samo trafienie zwycięzcy lub remisu to <strong>3 punkty</strong>.</p>
        </div>
        
        <div class="matches-grid">
          ${matchesHtml}
        </div>
        
        <div id="bet-save-toast" class="toast hidden">Pomyślnie zapisano typ! ✓</div>
      </div>
    `;

    // Bind save events
    container.querySelectorAll('.match-bet-form').forEach(form => {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const matchId = form.getAttribute('data-match-id');
        const homeScore = form.querySelector('.home-score').value;
        const awayScore = form.querySelector('.away-score').value;
        
        const saveButton = form.querySelector('.btn-bet-save');
        saveButton.disabled = true;
        saveButton.textContent = 'Zapisywanie...';

        try {
          await this.app.db.submitPrediction(room.code, matchId, homeScore, awayScore);
          
          // Display a beautiful visual toast
          const toast = container.querySelector('#bet-save-toast');
          toast.classList.remove('hidden');
          toast.classList.add('show');
          setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.classList.add('hidden'), 300);
          }, 2000);

          saveButton.textContent = 'Zapisano!';
          setTimeout(() => {
            saveButton.disabled = false;
            saveButton.textContent = 'Zapisz typ';
          }, 1000);

        } catch (err) {
          alert("Wystąpił błąd zapisu: " + err.message);
          saveButton.disabled = false;
          saveButton.textContent = 'Zapisz typ';
        }
      });
    });
  }

  /**
   * Tab 3: Special Long-term Predictions Component
   */
  renderTabSpecial(container, room) {
    const currentUser = this.app.db.getCurrentUser();
    const virtualTime = new Date(room.virtualTime || '2026-06-10T12:00:00');
    
    // First match kick-off: 2026-06-11 17:00
    const isLocked = virtualTime >= new Date('2026-06-11T17:00:00');
    
    const userSpecial = room.specialPredictions[currentUser] || {};
    const results = room.results || {};

    let formContent = '';

    if (isLocked) {
      // TOURNAMENT HAS STARTED - LOCK SELECTIONS
      const getTeamDisplay = (id) => {
        const t = findTeamById(id);
        return t ? `${getTeamFlagHtml(t.id)} ${t.name}` : `<span class="text-muted">Brak wyboru</span>`;
      };

      const getPointsBadge = (predVal, resVal, points) => {
        if (!resVal || !predVal) return '';
        return predVal === resVal ? `<span class="badge badge-success">+${points} pkt</span>` : `<span class="badge badge-secondary">0 pkt</span>`;
      };

      formContent = `
        <div class="special-locked-view">
          <div class="alert alert-warning">
            🔒 <strong>Typy długoterminowe są zablokowane.</strong> Mundial już się rozpoczął! Możesz podejrzeć swoje wybory oraz ewentualne punkty naliczone przez Hosta.
          </div>

          <div class="special-summary-grid">
            <div class="special-summary-item glass">
              <span class="icon">🏆</span>
              <h4>Top 1 (Mistrz)</h4>
              <div class="user-choice">${getTeamDisplay(userSpecial.top1)}</div>
              ${results.top1 ? `
                <div class="actual-result">Wynik: <strong>${getTeamDisplay(results.top1)}</strong></div>
                ${getPointsBadge(userSpecial.top1, results.top1, 10)}
              ` : ''}
              <div class="pts-info">Nagroda: 10 pkt</div>
            </div>

            <div class="special-summary-item glass">
              <span class="icon">🥈</span>
              <h4>Top 2 (Wicemistrz)</h4>
              <div class="user-choice">${getTeamDisplay(userSpecial.top2)}</div>
              ${results.top2 ? `
                <div class="actual-result">Wynik: <strong>${getTeamDisplay(results.top2)}</strong></div>
                ${getPointsBadge(userSpecial.top2, results.top2, 8)}
              ` : ''}
              <div class="pts-info">Nagroda: 8 pkt</div>
            </div>

            <div class="special-summary-item glass">
              <span class="icon">🥉</span>
              <h4>Top 3 (Trzecie miejsce)</h4>
              <div class="user-choice">${getTeamDisplay(userSpecial.top3)}</div>
              ${results.top3 ? `
                <div class="actual-result">Wynik: <strong>${getTeamDisplay(results.top3)}</strong></div>
                ${getPointsBadge(userSpecial.top3, results.top3, 6)}
              ` : ''}
              <div class="pts-info">Nagroda: 6 pkt</div>
            </div>

            <div class="special-summary-item glass">
              <span class="icon">🏅</span>
              <h4>Top 4 (Czwarte miejsce)</h4>
              <div class="user-choice">${getTeamDisplay(userSpecial.top4)}</div>
              ${results.top4 ? `
                <div class="actual-result">Wynik: <strong>${getTeamDisplay(results.top4)}</strong></div>
                ${getPointsBadge(userSpecial.top4, results.top4, 4)}
              ` : ''}
              <div class="pts-info">Nagroda: 4 pkt</div>
            </div>

            <div class="special-summary-item glass">
              <span class="icon">👟</span>
              <h4>Król Strzelców</h4>
              <div class="user-choice"><strong>${userSpecial.goldenBoot || '<span class="text-muted">Brak wyboru</span>'}</strong></div>
              ${results.goldenBoot ? `
                <div class="actual-result">Wynik: <strong>${results.goldenBoot}</strong></div>
                ${userSpecial.goldenBoot === results.goldenBoot ? '<span class="badge badge-success">+10 pkt</span>' : '<span class="badge badge-secondary">0 pkt</span>'}
              ` : ''}
              <div class="pts-info">Nagroda: 10 pkt</div>
            </div>

            <div class="special-summary-item glass">
              <span class="icon">🅰️</span>
              <h4>Najwięcej Asyst</h4>
              <div class="user-choice"><strong>${userSpecial.assists || '<span class="text-muted">Brak wyboru</span>'}</strong></div>
              ${results.assists ? `
                <div class="actual-result">Wynik: <strong>${results.assists}</strong></div>
                ${userSpecial.assists === results.assists ? '<span class="badge badge-success">+10 pkt</span>' : '<span class="badge badge-secondary">0 pkt</span>'}
              ` : ''}
              <div class="pts-info">Nagroda: 10 pkt</div>
            </div>
          </div>
        </div>
      `;
    } else {
      // TOURNAMENT HAS NOT STARTED - EDITABLE SELECTIONS
      const teamOptions = TEAMS.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
      const playerOptions = PLAYERS.map(p => `<option value="${p}">${p}</option>`).join('');

      formContent = `
        <form id="special-predictions-form" class="special-form">
          <div class="alert alert-success">
            🔓 <strong>Mundial jeszcze się nie rozpoczął!</strong> Możesz swobodnie ustawiać i modyfikować swoje typy długoterminowe. Zostaną zablokowane w momencie startu pierwszego meczu.
          </div>

          <div class="special-inputs-grid">
            <div class="form-group glass">
              <label for="spec-top1">🏆 1. Miejsce (MISTRZ)</label>
              <select id="spec-top1" required class="select-glow">
                <option value="" disabled selected>-- Wybierz Mistrza --</option>
                ${teamOptions}
              </select>
              <small class="form-hint">Zyskasz <strong>10 punktów</strong> za poprawne wytypowanie.</small>
            </div>

            <div class="form-group glass">
              <label for="spec-top2">🥈 2. Miejsce</label>
              <select id="spec-top2" required class="select-glow">
                <option value="" disabled selected>-- Wybierz Wicemistrza --</option>
                ${teamOptions}
              </select>
              <small class="form-hint">Zyskasz <strong>8 punktów</strong> za poprawne wytypowanie.</small>
            </div>

            <div class="form-group glass">
              <label for="spec-top3">🥉 3. Miejsce</label>
              <select id="spec-top3" required class="select-glow">
                <option value="" disabled selected>-- Wybierz 3. miejsce --</option>
                ${teamOptions}
              </select>
              <small class="form-hint">Zyskasz <strong>6 punktów</strong> za poprawne wytypowanie.</small>
            </div>

            <div class="form-group glass">
              <label for="spec-top4">🏅 4. Miejsce</label>
              <select id="spec-top4" required class="select-glow">
                <option value="" disabled selected>-- Wybierz 4. miejsce --</option>
                ${teamOptions}
              </select>
              <small class="form-hint">Zyskasz <strong>4 punkty</strong> za poprawne wytypowanie.</small>
            </div>

            <div class="form-group glass">
              <label for="spec-boot">👟 Król Strzelców (Złoty But)</label>
              <select id="spec-boot" required class="select-glow">
                <option value="" disabled selected>-- Wybierz strzelca --</option>
                ${playerOptions}
              </select>
              <small class="form-hint">Zyskasz <strong>10 punktów</strong> za poprawne wytypowanie.</small>
            </div>

            <div class="form-group glass">
              <label for="spec-assists">🅰️ Król Asyst</label>
              <select id="spec-assists" required class="select-glow">
                <option value="" disabled selected>-- Wybierz asystenta --</option>
                ${playerOptions}
              </select>
              <small class="form-hint">Zyskasz <strong>10 punktów</strong> za poprawne wytypowanie.</small>
            </div>
          </div>

          <div class="form-actions text-center">
            <button type="submit" class="btn btn-primary btn-lg">Zapisz Typy Specjalne ✓</button>
          </div>
        </form>
      `;
    }

    container.innerHTML = `
      <div class="special-predictions-container">
        <div class="tab-section-header glass-card">
          <h3>🔮 Typy Długoterminowe (Specjalne)</h3>
          <p>Obstaw ostateczny układ sił w turnieju, króla strzelców i najlepszego asystenta turnieju przed rozpoczęciem pierwszego gwizdka!</p>
        </div>

        ${formContent}
        <div id="special-save-toast" class="toast hidden">Pomyślnie zapisano typy specjalne! ✓</div>
      </div>
    `;

    // Populate values if they exist
    if (!isLocked) {
      const form = container.querySelector('#special-predictions-form');
      if (userSpecial.top1) form.querySelector('#spec-top1').value = findTeamById(userSpecial.top1)?.id || userSpecial.top1;
      if (userSpecial.top2) form.querySelector('#spec-top2').value = findTeamById(userSpecial.top2)?.id || userSpecial.top2;
      if (userSpecial.top3) form.querySelector('#spec-top3').value = findTeamById(userSpecial.top3)?.id || userSpecial.top3;
      if (userSpecial.top4) form.querySelector('#spec-top4').value = findTeamById(userSpecial.top4)?.id || userSpecial.top4;
      if (userSpecial.goldenBoot) form.querySelector('#spec-boot').value = userSpecial.goldenBoot;
      if (userSpecial.assists) form.querySelector('#spec-assists').value = userSpecial.assists;

      // Handle submit
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const obj = {
          top1: form.querySelector('#spec-top1').value,
          top2: form.querySelector('#spec-top2').value,
          top3: form.querySelector('#spec-top3').value,
          top4: form.querySelector('#spec-top4').value,
          goldenBoot: form.querySelector('#spec-boot').value,
          assists: form.querySelector('#spec-assists').value
        };

        const saveBtn = form.querySelector('button[type="submit"]');
        saveBtn.disabled = true;
        saveBtn.textContent = 'Trwa zapisywanie...';

        try {
          await this.app.db.submitSpecialPredictions(room.code, obj);
          
          const toast = container.querySelector('#special-save-toast');
          toast.classList.remove('hidden');
          toast.classList.add('show');
          setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.classList.add('hidden'), 300);
          }, 2000);

          saveBtn.textContent = 'Typy Zapisane!';
          setTimeout(() => {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Zapisz Typy Specjalne ✓';
          }, 1000);
        } catch (err) {
          alert("Błąd: " + err.message);
          saveBtn.disabled = false;
          saveBtn.textContent = 'Zapisz Typy Specjalne ✓';
        }
      });
    }
  }

  /**
   * Tab 4: Admin Panel / Game Simulator Component
   */
  renderTabAdmin(container, room) {
    const teamOptions = TEAMS.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
    const playerOptions = PLAYERS.map(p => `<option value="${p}">${p}</option>`).join('');
    
    const savedFirebaseConfig = this.app.db.getFirebaseConfig();
    const isFirebaseMode = this.app.db.isFirebase;

    container.innerHTML = `
      <div class="admin-tab-container">
        
        <!-- SECTION 1: VIRTUAL TIME CONTROLLER -->
        <div class="admin-section glass-card">
          <div class="admin-section-header">
            <span class="section-icon">⏱</span>
            <div>
              <h3>Kontrola Wirtualnego Czasu (Zegar)</h3>
              <p>Zmieniaj czas systemowy turnieju, aby symulować automatyczne blokowanie typów i przełączanie faz meczów.</p>
            </div>
          </div>
          <div class="clock-sim-panel">
            <div class="current-sim-time">
              <span>Wirtualny Czas Obecnie:</span>
              <strong class="text-neon-cyan">${this.formatDate(room.virtualTime)}</strong>
            </div>

            <div class="sim-quick-buttons">
              <button class="btn btn-outline-cyan btn-time-set" data-time="2026-06-10T12:00:00">Przed Mundialem (10.06)</button>
              <button class="btn btn-outline-cyan btn-time-set" data-time="2026-06-11T17:30:00">W trakcie meczu otwarcia (11.06 17:30)</button>
              <button class="btn btn-outline-cyan btn-time-set" data-time="2026-06-12T18:00:00">Drugi dzień Mundialu (12.06 18:00)</button>
              <button class="btn btn-outline-cyan btn-time-set" data-time="2026-06-16T12:00:00">Po fazie grupowej (16.06)</button>
            </div>

            <form id="custom-time-form" class="custom-time-form">
              <div class="form-group-row">
                <label for="custom-datetime">Wybierz własną datę i czas:</label>
                <input type="datetime-local" id="custom-datetime" required>
                <button type="submit" class="btn btn-cyan">Zastosuj czas</button>
              </div>
            </form>
          </div>
        </div>

        <!-- SECTION 2: MATCH RESULTS SUBMITTER -->
        <div class="admin-section glass-card">
          <div class="admin-section-header">
            <span class="section-icon">⚽</span>
            <div>
              <h3>Zarządzanie Wynikami Meczów</h3>
              <p>Wpisuj realne wyniki spotkań, aby automatycznie przeliczyć punkty dla wszystkich graczy należących do pokoju.</p>
            </div>
          </div>

          <div class="admin-matches-list">
            ${MATCHES.map(match => {
              const actual = room.matchScores[match.id] || {};
              const homeVal = actual.home !== undefined ? actual.home : '';
              const awayVal = actual.away !== undefined ? actual.away : '';
              
              const isMatchPlayed = actual.home !== undefined;

              return `
                <div class="admin-match-row glass ${isMatchPlayed ? 'match-played-row' : ''}">
                  <div class="match-info">
                    <span class="stage">${match.stage}</span>
                    <span class="teams">${getTeamFlagHtml(match.home)} ${match.homeName} vs ${getTeamFlagHtml(match.away)} ${match.awayName}</span>
                    <span class="time">Start: ${this.formatDate(match.startTime)}</span>
                  </div>
                  
                  <form class="admin-match-score-form" data-match-id="${match.id}">
                    <div class="inputs">
                      <input type="number" class="score-input home" min="0" placeholder="-" required value="${homeVal}">
                      <span>:</span>
                      <input type="number" class="score-input away" min="0" placeholder="-" required value="${awayVal}">
                    </div>
                    <button type="submit" class="btn btn-sm ${isMatchPlayed ? 'btn-success' : 'btn-primary'}">
                      ${isMatchPlayed ? 'Zaktualizuj wynik ✓' : 'Zapisz wynik'}
                    </button>
                  </form>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- SECTION 3: SPECIAL/LONG-TERM RESULTS SUBMITTER -->
        <div class="admin-section glass-card">
          <div class="admin-section-header">
            <span class="section-icon">🏆</span>
            <div>
              <h3>Oficjalne Rozliczenie Mundialu</h3>
              <p>Wpisz oficjalne rezultaty końcowe Mistrzostw Świata, aby rozstrzygnąć typy długoterminowe.</p>
            </div>
          </div>

          <form id="admin-specials-form" class="admin-specials-form">
            <div class="admin-specials-grid">
              <div class="form-group">
                <label for="admin-top1">🏆 Mistrz (Top 1)</label>
                <select id="admin-top1" required class="select-glow">
                  <option value="" disabled selected>-- Wybierz oficjalnego Mistrza --</option>
                  ${teamOptions}
                </select>
              </div>

              <div class="form-group">
                <label for="admin-top2">🥈 2. Miejsce</label>
                <select id="admin-top2" required class="select-glow">
                  <option value="" disabled selected>-- Wybierz 2. miejsce --</option>
                  ${teamOptions}
                </select>
              </div>

              <div class="form-group">
                <label for="admin-top3">🥉 3. Miejsce</label>
                <select id="admin-top3" required class="select-glow">
                  <option value="" disabled selected>-- Wybierz 3. miejsce --</option>
                  ${teamOptions}
                </select>
              </div>

              <div class="form-group">
                <label for="admin-top4">🏅 4. Miejsce</label>
                <select id="admin-top4" required class="select-glow">
                  <option value="" disabled selected>-- Wybierz 4. miejsce --</option>
                  ${teamOptions}
                </select>
              </div>

              <div class="form-group">
                <label for="admin-boot">👟 Król Strzelców</label>
                <select id="admin-boot" required class="select-glow">
                  <option value="" disabled selected>-- Wybierz strzelca --</option>
                  ${playerOptions}
                </select>
              </div>

              <div class="form-group">
                <label for="admin-assists">🅰️ Król Asyst</label>
                <select id="admin-assists" required class="select-glow">
                  <option value="" disabled selected>-- Wybierz asystenta --</option>
                  ${playerOptions}
                </select>
              </div>
            </div>

            <button type="submit" class="btn btn-warning btn-lg btn-block">
              Rozlicz typy długoterminowe turnieju 🔮
            </button>
          </form>
        </div>

        <!-- SECTION 4: FIREBASE GLOBAL MULTIPLAYER CLOUD SETTINGS -->
        <div class="admin-section glass-card">
          <div class="admin-section-header">
            <span class="section-icon">☁️</span>
            <div>
              <h3>Zarządzanie Chmurą Firebase (Multiplayer)</h3>
              <p>Chcesz grać ze znajomymi ze swoich telefonów i różnych komputerów? Wklej tutaj konfigurację ze swojego konsoli Firebase, aby przenieść aplikację w chmurę!</p>
            </div>
          </div>
          
          <div class="firebase-settings-panel">
            ${isFirebaseMode ? `
              <div class="alert alert-success">
                🟢 <strong>Baza danych w chmurze Firebase Firestore jest włączona i połączona!</strong> Twój pokój jest w pełni wieloosobowy w czasie rzeczywistym.
              </div>
              <button id="btn-disable-firebase" class="btn btn-danger">Wyłącz Firebase (Wróć do LocalStorage)</button>
            ` : `
              <div class="alert alert-secondary">
                ⚪ <strong>Tryb lokalny (LocalStorage).</strong> Dane zapisują się tylko w tej przeglądarce.
              </div>
              
              <form id="firebase-config-form" class="firebase-config-form">
                <div class="form-group">
                  <label for="firebase-config-text">Konfiguracja Firebase JSON</label>
                  <textarea id="firebase-config-text" required placeholder='{\n  "apiKey": "...",\n  "authDomain": "...",\n  "projectId": "...",\n  "storageBucket": "...",\n  "messagingSenderId": "...",\n  "appId": "..."\n}' rows="7" class="textarea-glow"></textarea>
                  <small class="form-hint">Wklej kompletny obiekt JSON swojej konfiguracji aplikacji webowej Firebase.</small>
                </div>
                <button type="submit" class="btn btn-primary">Aktywuj Multi-urządzeniowy Chmurę Firebase</button>
              </form>
            `}
          </div>
        </div>

      </div>
    `;

    // Populate current datetime-local input with virtualTime
    const dtInput = container.querySelector('#custom-datetime');
    const localISO = new Date(new Date(room.virtualTime).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    dtInput.value = localISO;

    // Time change quick buttons
    container.querySelectorAll('.btn-time-set').forEach(btn => {
      btn.addEventListener('click', async () => {
        const time = btn.getAttribute('data-time');
        try {
          await this.app.db.updateRoomData(room.code, { virtualTime: time });
          this.app.initApp();
        } catch (e) {
          alert("Błąd zmiany czasu: " + e.message);
        }
      });
    });

    // Custom time form submit
    container.querySelector('#custom-time-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const val = dtInput.value;
      const targetTimeISO = new Date(val).toISOString();
      try {
        await this.app.db.updateRoomData(room.code, { virtualTime: targetTimeISO });
        this.app.initApp();
      } catch (err) {
        alert("Błąd zmiany czasu: " + err.message);
      }
    });

    // Match scores submit events
    container.querySelectorAll('.admin-match-score-form').forEach(form => {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const matchId = form.getAttribute('data-match-id');
        const homeVal = parseInt(form.querySelector('.home').value, 10);
        const awayVal = parseInt(form.querySelector('.away').value, 10);

        const currentScores = room.matchScores || {};
        currentScores[matchId] = { home: homeVal, away: awayVal };

        try {
          await this.app.db.updateRoomData(room.code, { matchScores: currentScores });
          
          const submitBtn = form.querySelector('button[type="submit"]');
          submitBtn.textContent = 'Zapisano!';
          submitBtn.classList.remove('btn-primary');
          submitBtn.classList.add('btn-success');

          // Full reload of dashboard elements to recalculate stats
          setTimeout(() => {
            this.app.initApp();
          }, 500);

        } catch (err) {
          alert("Błąd zapisu wyniku: " + err.message);
        }
      });
    });

    // Populate special prediction fields if they are already resolved
    const res = room.results || {};
    const specialsForm = container.querySelector('#admin-specials-form');
    if (res.top1) specialsForm.querySelector('#admin-top1').value = findTeamById(res.top1)?.id || res.top1;
    if (res.top2) specialsForm.querySelector('#admin-top2').value = findTeamById(res.top2)?.id || res.top2;
    if (res.top3) specialsForm.querySelector('#admin-top3').value = findTeamById(res.top3)?.id || res.top3;
    if (res.top4) specialsForm.querySelector('#admin-top4').value = findTeamById(res.top4)?.id || res.top4;
    if (res.goldenBoot) specialsForm.querySelector('#admin-boot').value = res.goldenBoot;
    if (res.assists) specialsForm.querySelector('#admin-assists').value = res.assists;

    // Special predictions resolve submit
    specialsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const updatedResults = {
        top1: specialsForm.querySelector('#admin-top1').value,
        top2: specialsForm.querySelector('#admin-top2').value,
        top3: specialsForm.querySelector('#admin-top3').value,
        top4: specialsForm.querySelector('#admin-top4').value,
        goldenBoot: specialsForm.querySelector('#admin-boot').value,
        assists: specialsForm.querySelector('#admin-assists').value
      };

      try {
        await this.app.db.updateRoomData(room.code, { 
          results: updatedResults,
          tournamentStatus: 'finished'
        });
        alert("Pomyślnie rozliczono typy długoterminowe! Punkty zostały przyznane.");
        this.app.initApp();
      } catch (err) {
        alert("Błąd rozliczenia: " + err.message);
      }
    });

    // Firebase Settings logic
    if (isFirebaseMode) {
      container.querySelector('#btn-disable-firebase').addEventListener('click', () => {
        this.app.db.disableFirebase();
        alert("Wyłączono Firebase. Nastąpiło przełączenie na tryb LocalStorage.");
        window.location.reload();
      });
    } else {
      container.querySelector('#firebase-config-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const jsonText = container.querySelector('#firebase-config-text').value;
        try {
          const config = JSON.parse(jsonText);
          if (!config.apiKey || !config.projectId) {
            throw new Error("Podany JSON nie posiada wymaganych pól 'apiKey' lub 'projectId'!");
          }

          const actBtn = container.querySelector('#firebase-config-form button[type="submit"]');
          actBtn.disabled = true;
          actBtn.textContent = 'Inicjalizacja połączenia...';

          await this.app.db.enableFirebase(config);
          
          alert("Połączono pomyślnie z bazą Firebase Firestore! Twoja aplikacja działa w trybie chmurowym.");
          window.location.reload();
        } catch (err) {
          alert("Błąd aktywacji Firebase: " + err.message + "\nUpewnij się, że wkleiłeś poprawny JSON.");
          const actBtn = container.querySelector('#firebase-config-form button[type="submit"]');
          actBtn.disabled = false;
          actBtn.textContent = 'Aktywuj Multi-urządzeniowy Chmurę Firebase';
        }
      });
    }
  }
}
