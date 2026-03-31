export function getHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Codenames</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0f172a;
    --card: #1e293b;
    --card-hover: #334155;
    --text: #f1f5f9;
    --text-muted: #94a3b8;
    --red: #dc2626;
    --red-light: #fca5a5;
    --red-glow: rgba(220, 38, 38, 0.4);
    --blue: #2563eb;
    --blue-light: #93c5fd;
    --blue-glow: rgba(37, 99, 235, 0.4);
    --neutral: #64748b;
    --assassin: #000000;
    --border: #334155;
    --green: #059669;
    --purple: #7c3aed;
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
  }

  .container { max-width: 1100px; margin: 0 auto; padding: 16px; }

  header { text-align: center; margin-bottom: 20px; }

  h1 {
    font-size: 2.5rem;
    font-weight: 900;
    letter-spacing: 0.3em;
    background: linear-gradient(135deg, var(--red), #f87171, var(--blue), #60a5fa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 4px;
  }

  .subtitle { color: var(--text-muted); font-size: 0.85rem; }

  /* Toast */
  .toast {
    position: fixed; top: 20px; left: 50%;
    transform: translateX(-50%) translateY(-100px);
    background: #10b981; color: white; padding: 12px 24px;
    border-radius: 8px; font-weight: 600; z-index: 1000;
    transition: transform 0.3s ease; pointer-events: none;
  }
  .toast.show { transform: translateX(-50%) translateY(0); }

  /* Screens */
  .screen { display: none; }
  .screen.active { display: block; }

  /* ===== LANDING SCREEN ===== */
  .landing-box {
    max-width: 440px; margin: 40px auto; text-align: center;
    background: var(--card); border: 1px solid var(--border);
    border-radius: 16px; padding: 36px;
  }

  .landing-box h2 { font-size: 1.3rem; margin-bottom: 20px; }

  .landing-row {
    display: flex; gap: 10px; margin-bottom: 16px;
  }

  .landing-row input {
    flex: 1; background: var(--bg); border: 2px solid var(--border);
    color: var(--text); padding: 12px 16px; border-radius: 10px;
    font-size: 1rem; text-transform: uppercase; letter-spacing: 0.15em;
    text-align: center; outline: none; transition: border-color 0.2s;
  }
  .landing-row input:focus { border-color: var(--blue); }
  .landing-row input::placeholder { text-transform: none; letter-spacing: normal; color: var(--text-muted); }

  .landing-divider {
    color: var(--text-muted); font-size: 0.8rem; margin: 12px 0;
    text-transform: uppercase; letter-spacing: 0.1em;
  }

  .btn {
    padding: 12px 24px; border: none; border-radius: 10px;
    font-size: 0.9rem; font-weight: 700; cursor: pointer;
    transition: all 0.2s; text-transform: uppercase; letter-spacing: 0.08em;
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  }
  .btn:active { transform: scale(0.96); }
  .btn-blue { background: var(--blue); color: white; }
  .btn-blue:hover { background: #3b82f6; }
  .btn-green { background: var(--green); color: white; }
  .btn-green:hover { background: #10b981; }
  .btn-red { background: var(--red); color: white; }
  .btn-red:hover { background: #ef4444; }
  .btn-secondary { background: var(--card); color: var(--text); border: 2px solid var(--border); }
  .btn-secondary:hover { border-color: var(--text-muted); background: var(--card-hover); }
  .btn-full { width: 100%; }
  .btn-disabled { opacity: 0.4; pointer-events: none; }

  /* ===== LOBBY SCREEN ===== */
  .lobby-box {
    max-width: 520px; margin: 20px auto; text-align: center;
    background: var(--card); border: 1px solid var(--border);
    border-radius: 16px; padding: 32px;
  }

  .room-code-big {
    font-size: 2.4rem; font-weight: 900; letter-spacing: 0.3em;
    cursor: pointer; padding: 8px 20px;
    border: 2px dashed var(--border); border-radius: 10px;
    display: inline-block; margin: 8px 0 16px;
    transition: all 0.2s;
  }
  .room-code-big:hover { border-color: var(--text-muted); background: rgba(255,255,255,0.03); }

  .room-code-hint { font-size: 0.75rem; color: var(--text-muted); margin-bottom: 20px; }

  .name-input-row {
    display: flex; gap: 10px; margin-bottom: 20px;
  }
  .name-input-row select {
    flex: 1; background: var(--bg); border: 2px solid var(--border);
    color: var(--text); padding: 10px 14px; border-radius: 10px;
    font-size: 0.95rem; outline: none; cursor: pointer;
    appearance: none; -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2394a3b8' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 12px center;
  }
  .name-input-row select:focus { border-color: var(--blue); }

  .role-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
    margin-bottom: 20px;
  }

  .role-card {
    padding: 16px 12px; border-radius: 12px;
    border: 2px solid var(--border); background: var(--bg);
    cursor: pointer; transition: all 0.2s; text-align: center;
  }
  .role-card:hover { border-color: var(--text-muted); }
  .role-card.taken { opacity: 0.35; pointer-events: none; }
  .role-card.selected { transform: scale(1.03); }
  .role-card.red-spy { border-color: var(--red); }
  .role-card.red-spy.selected { background: rgba(220,38,38,0.15); box-shadow: 0 0 16px var(--red-glow); }
  .role-card.red-op { border-color: var(--red); }
  .role-card.red-op.selected { background: rgba(220,38,38,0.1); box-shadow: 0 0 12px var(--red-glow); }
  .role-card.blue-spy { border-color: var(--blue); }
  .role-card.blue-spy.selected { background: rgba(37,99,235,0.15); box-shadow: 0 0 16px var(--blue-glow); }
  .role-card.blue-op { border-color: var(--blue); }
  .role-card.blue-op.selected { background: rgba(37,99,235,0.1); box-shadow: 0 0 12px var(--blue-glow); }

  .role-card .role-emoji { font-size: 1.5rem; margin-bottom: 6px; }
  .role-card .role-name { font-weight: 700; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; }
  .role-card .role-player { font-size: 0.75rem; color: var(--text-muted); margin-top: 4px; }
  .role-card .role-player-list { font-size: 0.7rem; color: var(--text-muted); margin-top: 4px; line-height: 1.5; }
  .role-card.red-spy .role-name, .role-card.red-op .role-name { color: var(--red-light); }
  .role-card.blue-spy .role-name, .role-card.blue-op .role-name { color: var(--blue-light); }

  .lobby-status { color: var(--text-muted); font-size: 0.85rem; margin-top: 12px; }

  /* Vote indicators */
  .vote-badge {
    position: absolute; top: 4px; right: 4px;
    background: #f59e0b; color: #000; font-size: 0.6rem;
    font-weight: 800; padding: 2px 5px; border-radius: 6px;
    z-index: 2; line-height: 1;
  }
  .vote-mine {
    position: absolute; bottom: 4px; left: 4px;
    background: #10b981; color: white; font-size: 0.55rem;
    font-weight: 700; padding: 2px 5px; border-radius: 6px;
    z-index: 2; line-height: 1;
    text-transform: uppercase; letter-spacing: 0.05em;
  }
  .card { position: relative; }

  .vote-status {
    text-align: center; margin-bottom: 10px; padding: 8px 14px;
    background: rgba(245,158,11,0.12); border: 1px solid rgba(245,158,11,0.3);
    border-radius: 8px; color: #fbbf24; font-size: 0.8rem; font-weight: 600;
  }

  /* ===== GAME SCREEN ===== */
  .my-role-banner {
    text-align: center; padding: 10px; border-radius: 10px; margin-bottom: 12px;
    font-weight: 700; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em;
  }
  .my-role-banner.red { background: rgba(220,38,38,0.15); color: var(--red-light); border: 1px solid rgba(220,38,38,0.3); }
  .my-role-banner.blue { background: rgba(37,99,235,0.15); color: var(--blue-light); border: 1px solid rgba(37,99,235,0.3); }

  .turn-indicator {
    text-align: center; margin-bottom: 14px; font-size: 1.05rem;
    font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;
    padding: 10px; border-radius: 10px; transition: all 0.3s;
  }
  .turn-indicator.red-turn { color: var(--red-light); background: rgba(220,38,38,0.12); box-shadow: 0 0 20px var(--red-glow); }
  .turn-indicator.blue-turn { color: var(--blue-light); background: rgba(37,99,235,0.12); box-shadow: 0 0 20px var(--blue-glow); }
  .turn-indicator.game-over-indicator { color: #fbbf24; background: rgba(251,191,36,0.12); box-shadow: 0 0 20px rgba(251,191,36,0.3); }

  .clue-display {
    text-align: center; margin-bottom: 14px; padding: 12px;
    background: var(--card); border: 1px solid var(--border); border-radius: 10px;
  }
  .clue-display .clue-label { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px; }
  .clue-display .clue-word { font-size: 1.6rem; font-weight: 900; letter-spacing: 0.1em; }
  .clue-display .clue-number { font-size: 1.1rem; font-weight: 700; color: var(--text-muted); }
  .clue-display.red .clue-word { color: var(--red-light); }
  .clue-display.blue .clue-word { color: var(--blue-light); }

  .clue-input-row {
    display: flex; gap: 10px; justify-content: center; margin-bottom: 14px;
    flex-wrap: wrap;
  }
  .clue-input-row input {
    background: var(--card); border: 2px solid var(--border); color: var(--text);
    padding: 10px 14px; border-radius: 10px; font-size: 0.95rem; outline: none;
  }
  .clue-input-row input:focus { border-color: var(--blue); }
  .clue-input-row .clue-word-input { width: 180px; text-transform: uppercase; letter-spacing: 0.05em; }
  .clue-input-row .clue-num-input { width: 70px; text-align: center; }

  .game-layout { display: flex; gap: 16px; align-items: flex-start; justify-content: center; }

  .score-panel {
    width: 90px; text-align: center; padding: 14px 6px;
    border-radius: 12px; background: var(--card); flex-shrink: 0;
  }
  .score-panel.red-panel { border: 2px solid var(--red); }
  .score-panel.blue-panel { border: 2px solid var(--blue); }
  .score-panel .team-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px; }
  .score-panel.red-panel .team-label { color: var(--red-light); }
  .score-panel.blue-panel .team-label { color: var(--blue-light); }
  .score-panel .score-value { font-size: 2.2rem; font-weight: 900; }
  .score-panel.red-panel .score-value { color: var(--red); }
  .score-panel.blue-panel .score-value { color: var(--blue); }
  .score-panel .score-sub { font-size: 0.65rem; color: var(--text-muted); margin-top: 2px; }

  .grid-container { flex: 1; max-width: 720px; }

  .grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 7px; }

  .card { aspect-ratio: 1.55; perspective: 600px; cursor: pointer; }
  .card.no-click { cursor: default; }

  .card-inner {
    width: 100%; height: 100%; position: relative;
    transition: transform 0.5s ease; transform-style: preserve-3d;
  }
  .card.revealed .card-inner { transform: rotateY(180deg); }

  .card-front, .card-back {
    position: absolute; inset: 0; backface-visibility: hidden;
    border-radius: 8px; display: flex; align-items: center;
    justify-content: center; padding: 4px; font-weight: 700;
    font-size: clamp(0.5rem, 1.4vw, 0.82rem); text-align: center;
    text-transform: uppercase; letter-spacing: 0.04em;
    word-break: break-word; line-height: 1.2;
  }

  .card-front {
    background: var(--card); border: 2px solid var(--border);
    color: var(--text); transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
  }
  .card:not(.revealed):not(.no-click):hover .card-front {
    background: var(--card-hover); border-color: var(--text-muted);
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  }

  .card-back {
    transform: rotateY(180deg); color: white;
    text-shadow: 0 1px 3px rgba(0,0,0,0.5);
    font-size: clamp(0.45rem, 1.2vw, 0.75rem);
  }
  .card-back.team-red { background: var(--red); }
  .card-back.team-blue { background: var(--blue); }
  .card-back.team-neutral { background: var(--neutral); }
  .card-back.team-assassin { background: var(--assassin); border: 2px solid #374151; }

  /* Spymaster colored borders on unrevealed */
  .card:not(.revealed) .card-front.spy-red { border-color: var(--red); box-shadow: inset 0 0 8px rgba(220,38,38,0.2); }
  .card:not(.revealed) .card-front.spy-blue { border-color: var(--blue); box-shadow: inset 0 0 8px rgba(37,99,235,0.2); }
  .card:not(.revealed) .card-front.spy-neutral { border-color: #a8a29e; box-shadow: inset 0 0 8px rgba(168,162,158,0.12); }
  .card:not(.revealed) .card-front.spy-assassin { border-color: #6b7280; background: rgba(0,0,0,0.2); }

  .actions { display: flex; justify-content: center; gap: 10px; margin-top: 14px; flex-wrap: wrap; }

  /* Mobile scores */
  .mobile-scores { display: none; gap: 16px; justify-content: center; margin-bottom: 10px; }
  .mobile-scores .ms { font-weight: 900; font-size: 1.05rem; }
  .mobile-scores .ms.red { color: var(--red); }
  .mobile-scores .ms.blue { color: var(--blue); }

  /* Overlay */
  .overlay {
    display: none; position: fixed; inset: 0;
    background: rgba(0,0,0,0.85); z-index: 500;
    justify-content: center; align-items: center; backdrop-filter: blur(4px);
  }
  .overlay.visible { display: flex; }
  .overlay-content {
    text-align: center; padding: 48px; border-radius: 20px;
    background: var(--card); border: 2px solid var(--border);
    max-width: 440px; animation: popIn 0.4s ease;
  }
  @keyframes popIn { 0% { transform: scale(0.7); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
  .overlay-content h2 { font-size: 2rem; margin-bottom: 8px; }
  .overlay-content .winner-red { color: var(--red); }
  .overlay-content .winner-blue { color: var(--blue); }
  .overlay-content p { color: var(--text-muted); margin-bottom: 24px; font-size: 1rem; }

  /* Confetti */
  .confetti-container { position: fixed; inset: 0; pointer-events: none; z-index: 600; overflow: hidden; }
  .confetti {
    position: absolute; width: 10px; height: 10px; top: -10px;
    animation: confettiFall linear forwards;
  }
  @keyframes confettiFall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }

  @media (max-width: 768px) {
    h1 { font-size: 1.6rem; }
    .game-layout { flex-direction: column; align-items: center; }
    .game-layout .score-panel { display: none; }
    .mobile-scores { display: flex !important; }
    .grid { gap: 5px; }
    .room-code-big { font-size: 1.6rem; }
    .overlay-content { margin: 20px; padding: 32px 24px; }
    .role-grid { grid-template-columns: 1fr; }
  }
</style>
</head>
<body>
  <div class="toast" id="toast">Copied!</div>

  <div class="container">
    <header>
      <h1>CODENAMES</h1>
      <p class="subtitle" id="headerSub">Online multiplayer board game</p>
    </header>

    <!-- LANDING SCREEN -->
    <div class="screen active" id="screenLanding">
      <div class="landing-box">
        <h2>Play Codenames</h2>
        <div class="landing-row">
          <input type="text" id="joinCodeInput" placeholder="Room code" maxlength="4">
          <button class="btn btn-blue" onclick="goToLobby()">Join</button>
        </div>
        <div class="landing-divider">or</div>
        <button class="btn btn-green btn-full" onclick="createAndGoToLobby()">Create New Game</button>
      </div>
    </div>

    <!-- LOBBY SCREEN -->
    <div class="screen" id="screenLobby">
      <div class="lobby-box">
        <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.1em">Room</div>
        <div class="room-code-big" id="lobbyRoomCode" onclick="copyCode()"></div>
        <div class="room-code-hint">Click code to copy &middot; Share with friends</div>

        <div class="name-input-row">
          <select id="nameInput">
            <option value="" disabled selected>Who are you?</option>
            <option value="AJ">AJ</option>
            <option value="SB">SB</option>
            <option value="Aryan">Aryan</option>
            <option value="LB">LB</option>
            <option value="Ms DTM">Ms DTM</option>
            <option value="Pops">Pops</option>
            <option value="Mom">Mom</option>
            <option value="Mikhayl">Mikhayl</option>
            <option value="Arhan">Arhan</option>
          </select>
        </div>

        <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:10px;text-transform:uppercase;letter-spacing:0.08em">Pick your role</div>

        <div class="role-grid" id="roleGrid">
          <div class="role-card red-spy" data-role="red-spymaster" onclick="selectRole(this)">
            <div class="role-emoji">🕵️</div>
            <div class="role-name">Red Spymaster</div>
            <div class="role-player" id="slot-red-spymaster">Open</div>
          </div>
          <div class="role-card blue-spy" data-role="blue-spymaster" onclick="selectRole(this)">
            <div class="role-emoji">🕵️</div>
            <div class="role-name">Blue Spymaster</div>
            <div class="role-player" id="slot-blue-spymaster">Open</div>
          </div>
          <div class="role-card red-op" data-role="red-operative" onclick="selectRole(this)">
            <div class="role-emoji">🔍</div>
            <div class="role-name">Red Operative</div>
            <div class="role-player-list" id="slot-red-operative">Open</div>
          </div>
          <div class="role-card blue-op" data-role="blue-operative" onclick="selectRole(this)">
            <div class="role-emoji">🔍</div>
            <div class="role-name">Blue Operative</div>
            <div class="role-player-list" id="slot-blue-operative">Open</div>
          </div>
        </div>

        <button class="btn btn-green btn-full btn-disabled" id="joinBtn" onclick="joinGame()">Join Game</button>
        <div class="lobby-status" id="lobbyStatus">Waiting for players...</div>
      </div>
    </div>

    <!-- GAME SCREEN -->
    <div class="screen" id="screenGame">
      <div class="my-role-banner" id="roleBanner"></div>
      <div class="turn-indicator" id="turnIndicator"></div>
      <div class="clue-display" id="clueDisplay" style="display:none">
        <div class="clue-label">Current Clue</div>
        <div class="clue-word" id="clueWord"></div>
        <div class="clue-number" id="clueNumber"></div>
      </div>
      <div class="vote-status" id="voteStatus" style="display:none"></div>
      <div class="clue-input-row" id="clueInputRow" style="display:none">
        <input type="text" class="clue-word-input" id="clueWordInput" placeholder="Clue word" maxlength="30">
        <input type="number" class="clue-num-input" id="clueNumInput" placeholder="#" min="0" max="9" value="1">
        <button class="btn btn-green" onclick="giveClue()">Give Clue</button>
      </div>

      <div class="mobile-scores" id="mobileScores">
        <span class="ms red" id="mRedScore"></span>
        <span style="color:var(--text-muted)">&mdash;</span>
        <span class="ms blue" id="mBlueScore"></span>
      </div>

      <div class="game-layout">
        <div class="score-panel red-panel">
          <div class="team-label">Red</div>
          <div class="score-value" id="redScore">0</div>
          <div class="score-sub">remaining</div>
        </div>
        <div class="grid-container">
          <div class="grid" id="grid"></div>
        </div>
        <div class="score-panel blue-panel">
          <div class="team-label">Blue</div>
          <div class="score-value" id="blueScore">0</div>
          <div class="score-sub">remaining</div>
        </div>
      </div>

      <div class="actions" id="gameActions">
        <button class="btn btn-secondary" id="endTurnBtn" onclick="endTurn()" style="display:none">End Turn</button>
        <button class="btn btn-red" onclick="newRound()">New Round</button>
      </div>
    </div>
  </div>

  <div class="overlay" id="overlay">
    <div class="overlay-content" id="overlayContent"></div>
  </div>
  <div class="confetti-container" id="confettiContainer"></div>

<script>
  let roomCode = null;
  let playerId = null;
  let myRole = null;
  let myTeam = null;
  let selectedRole = null;
  let pollInterval = null;
  let lastStateJSON = '';

  // ===== LANDING =====
  function createAndGoToLobby() {
    fetch('/api/create', { method: 'POST' })
      .then(r => r.json())
      .then(data => {
        roomCode = data.roomCode;
        showScreen('screenLobby');
        document.getElementById('lobbyRoomCode').textContent = roomCode;
        startLobbyPoll();
      })
      .catch(() => showToast('Failed to create game'));
  }

  function goToLobby() {
    const code = document.getElementById('joinCodeInput').value.trim().toUpperCase();
    if (code.length !== 4) { showToast('Enter a 4-character code'); return; }
    fetch('/api/game/' + code)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => {
        roomCode = data.roomCode;
        showScreen('screenLobby');
        document.getElementById('lobbyRoomCode').textContent = roomCode;
        updateLobbySlots(data.players || []);
        startLobbyPoll();
      })
      .catch(() => showToast('Game not found'));
  }

  document.getElementById('joinCodeInput').addEventListener('keydown', e => { if (e.key === 'Enter') goToLobby(); });

  // ===== LOBBY =====
  function selectRole(el) {
    document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    selectedRole = el.dataset.role;
    updateJoinBtn();
  }

  function updateJoinBtn() {
    const name = document.getElementById('nameInput').value.trim();
    const btn = document.getElementById('joinBtn');
    if (selectedRole && name) btn.classList.remove('btn-disabled');
    else btn.classList.add('btn-disabled');
  }

  document.getElementById('nameInput').addEventListener('change', updateJoinBtn);

  function joinGame() {
    if (!selectedRole || !roomCode) return;
    const name = document.getElementById('nameInput').value.trim();
    if (!name) { showToast('Enter your name'); return; }

    fetch('/api/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId: roomCode, name, role: selectedRole })
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) { showToast(data.error); return; }
        playerId = data.playerId;
        myRole = data.game._playerRole;
        myTeam = data.game._playerTeam;
        if (data.game.phase === 'lobby') {
          updateLobbySlots(data.game.players);
          document.getElementById('lobbyStatus').textContent = 'Waiting for all 4 roles to be filled...';
          document.getElementById('joinBtn').classList.add('btn-disabled');
          document.getElementById('joinBtn').textContent = 'Joined ✓';
        } else {
          showScreen('screenGame');
          stopPolling();
          renderGame(data.game);
          startGamePoll();
        }
      })
      .catch(() => showToast('Failed to join'));
  }

  function updateLobbySlots(players) {
    // Spymasters: single slot
    ['red-spymaster','blue-spymaster'].forEach(role => {
      const slot = document.getElementById('slot-' + role);
      const card = document.querySelector('[data-role="' + role + '"]');
      const p = players.find(pl => pl.role === role);
      if (p) {
        slot.textContent = p.name;
        card.classList.add('taken');
        if (role === selectedRole && p.id !== playerId) {
          card.classList.remove('selected');
          selectedRole = null;
        }
      } else {
        slot.textContent = 'Open';
        card.classList.remove('taken');
      }
    });
    // Operatives: multiple allowed
    ['red-operative','blue-operative'].forEach(role => {
      const slot = document.getElementById('slot-' + role);
      const ops = players.filter(pl => pl.role === role);
      if (ops.length > 0) {
        slot.innerHTML = ops.map(o => o.name).join(', ');
      } else {
        slot.innerHTML = 'Open &mdash; join to be first!';
      }
      // Operative cards never get .taken class since multiple can join
    });
  }

  function startLobbyPoll() {
    stopPolling();
    pollInterval = setInterval(() => {
      if (!roomCode) return;
      fetch('/api/game/' + roomCode + (playerId ? '?playerId=' + playerId : ''))
        .then(r => r.json())
        .then(data => {
          if (data.error) return;
          updateLobbySlots(data.players || []);
          if (data.phase !== 'lobby' && playerId) {
            myRole = data._playerRole;
            myTeam = data._playerTeam;
            showScreen('screenGame');
            stopPolling();
            renderGame(data);
            startGamePoll();
          }
        })
        .catch(() => {});
    }, 1500);
  }

  // ===== GAME =====
  function startGamePoll() {
    stopPolling();
    pollInterval = setInterval(() => {
      if (!roomCode || !playerId) return;
      fetch('/api/game/' + roomCode + '?playerId=' + playerId)
        .then(r => r.json())
        .then(data => {
          if (data.error) return;
          const json = JSON.stringify(data);
          if (json !== lastStateJSON) {
            lastStateJSON = json;
            renderGame(data);
          }
        })
        .catch(() => {});
    }, 1500);
  }

  function renderGame(state) {
    // Role banner
    const banner = document.getElementById('roleBanner');
    const teamLabel = myTeam === 'red' ? 'Red' : 'Blue';
    const roleLabel = myRole.includes('spymaster') ? 'Spymaster' : 'Operative';
    banner.textContent = teamLabel + ' ' + roleLabel;
    banner.className = 'my-role-banner ' + myTeam;

    // Turn indicator
    const ti = document.getElementById('turnIndicator');
    if (state.gameOver) {
      ti.className = 'turn-indicator game-over-indicator';
      ti.textContent = state.winner ? state.winner.toUpperCase() + ' WINS!' : 'GAME OVER';
    } else if (state.phase === 'clue') {
      ti.className = 'turn-indicator ' + state.currentTeam + '-turn';
      ti.textContent = state.currentTeam.toUpperCase() + ' SPYMASTER — GIVE A CLUE';
    } else {
      ti.className = 'turn-indicator ' + state.currentTeam + '-turn';
      ti.textContent = state.currentTeam.toUpperCase() + ' OPERATIVES — GUESS';
    }

    // Clue display
    const cd = document.getElementById('clueDisplay');
    if (state.currentClue && state.phase === 'guess') {
      cd.style.display = 'block';
      cd.className = 'clue-display ' + state.currentClue.team;
      document.getElementById('clueWord').textContent = state.currentClue.word;
      document.getElementById('clueNumber').textContent = state.currentClue.number + ' (' + state.currentClue.guessesLeft + ' guesses left)';
    } else {
      cd.style.display = 'none';
    }

    // Clue input (only for current spymaster during clue phase)
    const ci = document.getElementById('clueInputRow');
    const isMyCluePhase = state.phase === 'clue' && !state.gameOver &&
      ((state.currentTeam === 'red' && myRole === 'red-spymaster') ||
       (state.currentTeam === 'blue' && myRole === 'blue-spymaster'));
    ci.style.display = isMyCluePhase ? 'flex' : 'none';

    // End turn button (only for current operative during guess phase)
    const etb = document.getElementById('endTurnBtn');
    const isMyGuessPhase = state.phase === 'guess' && !state.gameOver &&
      ((state.currentTeam === 'red' && myRole === 'red-operative') ||
       (state.currentTeam === 'blue' && myRole === 'blue-operative'));
    etb.style.display = isMyGuessPhase ? 'inline-flex' : 'none';

    // Vote status
    const vs = document.getElementById('voteStatus');
    if (state.phase === 'guess' && !state.gameOver && state._totalOperatives > 1) {
      vs.style.display = 'block';
      if (state._votesIn === 0) {
        vs.textContent = 'Waiting for operatives to vote (' + state._totalOperatives + ' needed)';
      } else {
        vs.textContent = state._votesIn + ' of ' + state._totalOperatives + ' operatives voted — all must pick the same card';
      }
    } else {
      vs.style.display = 'none';
    }

    // Scores
    document.getElementById('redScore').textContent = state.redScore;
    document.getElementById('blueScore').textContent = state.blueScore;
    document.getElementById('mRedScore').textContent = 'RED ' + state.redScore;
    document.getElementById('mBlueScore').textContent = 'BLUE ' + state.blueScore;

    // Grid
    const grid = document.getElementById('grid');
    const isSpymaster = state._isSpymaster;
    const canGuess = isMyGuessPhase;
    const existingCards = grid.querySelectorAll('.card');

    const voteSummary = state.currentVotes || {};
    const myVote = state._myVote;

    // Always rebuild grid to keep vote badges in sync
    grid.innerHTML = '';
    state.cards.forEach((card, i) => {
      const el = document.createElement('div');
      const noClick = !canGuess || card.revealed;
      el.className = 'card' + (card.revealed ? ' revealed' : '') + (noClick ? ' no-click' : '');

      const spyClass = isSpymaster && !card.revealed ? ' spy-' + card.team : '';
      const backTeam = card.revealed || isSpymaster ? card.team : 'hidden';

      let badges = '';
      if (!card.revealed && state.phase === 'guess') {
        if (voteSummary[i]) {
          badges += '<div class="vote-badge">' + voteSummary[i] + ' vote' + (voteSummary[i] > 1 ? 's' : '') + '</div>';
        }
        if (myVote === i) {
          badges += '<div class="vote-mine">your pick</div>';
        }
      }

      el.innerHTML = badges +
        '<div class="card-inner">' +
          '<div class="card-front' + spyClass + '">' + card.word + '</div>' +
          '<div class="card-back team-' + backTeam + '">' + (backTeam === 'assassin' ? '💀 ' + card.word : card.word) + '</div>' +
        '</div>';
      el.onclick = () => guess(i);
      grid.appendChild(el);
    });

    // Game over
    if (state.gameOver && !document.getElementById('overlay').classList.contains('visible')) {
      showGameOver(state);
    }
    if (!state.gameOver) {
      document.getElementById('overlay').classList.remove('visible');
    }
  }

  function giveClue() {
    const word = document.getElementById('clueWordInput').value.trim();
    const num = parseInt(document.getElementById('clueNumInput').value) || 1;
    if (!word) { showToast('Enter a clue word'); return; }

    fetch('/api/clue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId: roomCode, playerId, word, number: num })
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) { showToast(data.error); return; }
        lastStateJSON = JSON.stringify(data);
        renderGame(data);
        document.getElementById('clueWordInput').value = '';
      })
      .catch(() => showToast('Failed to give clue'));
  }

  function guess(index) {
    if (!playerId || !roomCode) return;
    fetch('/api/guess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId: roomCode, playerId, cardIndex: index })
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) return;
        lastStateJSON = JSON.stringify(data);
        renderGame(data);
      })
      .catch(() => {});
  }

  function endTurn() {
    if (!playerId || !roomCode) return;
    fetch('/api/end-turn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId: roomCode, playerId })
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) { showToast(data.error); return; }
        lastStateJSON = JSON.stringify(data);
        renderGame(data);
      })
      .catch(() => {});
  }

  function newRound() {
    if (!playerId || !roomCode) return;
    fetch('/api/new-round', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId: roomCode, playerId })
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) { showToast(data.error); return; }
        lastStateJSON = '';
        renderGame(data);
        document.getElementById('overlay').classList.remove('visible');
        document.getElementById('confettiContainer').innerHTML = '';
      })
      .catch(() => {});
  }

  // ===== HELPERS =====
  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');

    if (id === 'screenLobby' || id === 'screenGame') {
      document.getElementById('headerSub').textContent = 'Room: ' + (roomCode || '');
    }
  }

  function stopPolling() {
    if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
  }

  function copyCode() {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode).then(() => showToast('Copied: ' + roomCode));
  }

  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2000);
  }

  function showGameOver(state) {
    const overlay = document.getElementById('overlay');
    const content = document.getElementById('overlayContent');
    const isAssassin = state.gameOverReason && state.gameOverReason.includes('assassin');
    let html = '';
    if (state.winner) {
      const wc = state.winner === 'red' ? 'winner-red' : 'winner-blue';
      html = '<h2 class="' + wc + '">' + state.winner.toUpperCase() + ' WINS!</h2>';
      html += '<p>' + (state.gameOverReason || '') + '</p>';
    } else {
      html = '<h2>GAME OVER</h2><p>' + (state.gameOverReason || '') + '</p>';
    }
    html += '<button class="btn btn-green" onclick="newRound()" style="margin-right:8px">New Round</button>';
    html += '<button class="btn btn-secondary" onclick="document.getElementById(\\'overlay\\').classList.remove(\\'visible\\')">Close</button>';
    content.innerHTML = html;
    overlay.classList.add('visible');
    if (!isAssassin) spawnConfetti();
  }

  function spawnConfetti() {
    const container = document.getElementById('confettiContainer');
    container.innerHTML = '';
    const colors = ['#dc2626','#2563eb','#f59e0b','#10b981','#8b5cf6','#f472b6','#fbbf24'];
    for (let i = 0; i < 80; i++) {
      const el = document.createElement('div');
      el.className = 'confetti';
      el.style.left = Math.random() * 100 + '%';
      el.style.background = colors[Math.floor(Math.random() * colors.length)];
      el.style.width = (6 + Math.random() * 8) + 'px';
      el.style.height = (6 + Math.random() * 8) + 'px';
      el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      el.style.animationDuration = (2 + Math.random() * 3) + 's';
      el.style.animationDelay = Math.random() * 2 + 's';
      container.appendChild(el);
    }
  }

  document.getElementById('clueWordInput').addEventListener('keydown', e => { if (e.key === 'Enter') giveClue(); });
</script>
</body>
</html>`;
}
