import { WORDS } from './words';
import { getHTML } from './html';

export interface Env {
  CODENAMES: KVNamespace;
}

interface Card {
  word: string;
  team: 'red' | 'blue' | 'neutral' | 'assassin';
  revealed: boolean;
}

type Role = 'red-spymaster' | 'red-operative' | 'blue-spymaster' | 'blue-operative';

interface Player {
  id: string;
  name: string;
  role: Role;
}

interface Clue {
  word: string;
  number: number;
  team: 'red' | 'blue';
  guessesLeft: number;
}

interface GameState {
  id: string;
  roomCode: string;
  cards: Card[];
  currentTeam: 'red' | 'blue';
  phase: 'lobby' | 'clue' | 'guess' | 'over';
  redScore: number;
  blueScore: number;
  winner: null | 'red' | 'blue';
  gameOver: boolean;
  gameOverReason: null | string;
  players: Player[];
  currentClue: Clue | null;
  clueHistory: Clue[];
  currentVotes: Record<string, number>; // playerId -> cardIndex
}

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function generatePlayerId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 12; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function createBoard(): { cards: Card[]; startingTeam: 'red' | 'blue' } {
  const words = shuffle(WORDS).slice(0, 25);
  const startingTeam: 'red' | 'blue' = Math.random() > 0.5 ? 'red' : 'blue';
  const otherTeam = startingTeam === 'red' ? 'blue' : 'red';

  const assignments: Card['team'][] = [
    ...Array(9).fill(startingTeam),
    ...Array(8).fill(otherTeam),
    ...Array(7).fill('neutral'),
    'assassin',
  ];

  const shuffledAssignments = shuffle(assignments);

  const cards: Card[] = words.map((word, i) => ({
    word,
    team: shuffledAssignments[i],
    revealed: false,
  }));

  return { cards, startingTeam };
}

function createGame(): GameState {
  const { cards, startingTeam } = createBoard();
  const roomCode = generateRoomCode();
  return {
    id: roomCode,
    roomCode,
    cards,
    currentTeam: startingTeam,
    phase: 'lobby',
    redScore: cards.filter(c => c.team === 'red').length,
    blueScore: cards.filter(c => c.team === 'blue').length,
    winner: null,
    gameOver: false,
    gameOverReason: null,
    players: [],
    currentClue: null,
    clueHistory: [],
    currentVotes: {},
  };
}

function canStartGame(players: Player[]): boolean {
  const hasRedSpy = players.some(p => p.role === 'red-spymaster');
  const hasBlueSpy = players.some(p => p.role === 'blue-spymaster');
  const hasRedOp = players.some(p => p.role === 'red-operative');
  const hasBlueOp = players.some(p => p.role === 'blue-operative');
  return hasRedSpy && hasBlueSpy && hasRedOp && hasBlueOp;
}

function getTeamOperatives(game: GameState, team: 'red' | 'blue'): Player[] {
  const role = team === 'red' ? 'red-operative' : 'blue-operative';
  return game.players.filter(p => p.role === role);
}

// Return game state filtered for a player's perspective
function filterStateForPlayer(game: GameState, playerId: string | null): object {
  const player = playerId ? game.players.find(p => p.id === playerId) : null;
  const isSpymaster = player?.role === 'red-spymaster' || player?.role === 'blue-spymaster';

  const cards = game.cards.map(card => {
    if (card.revealed || isSpymaster) {
      return card;
    }
    return { word: card.word, team: 'hidden' as const, revealed: false };
  });

  // Build vote summary: cardIndex -> count of votes
  const voteSummary: Record<number, number> = {};
  const teamOps = getTeamOperatives(game, game.currentTeam);
  const totalOps = teamOps.length;
  for (const [, idx] of Object.entries(game.currentVotes)) {
    voteSummary[idx] = (voteSummary[idx] || 0) + 1;
  }
  // Which card did this player vote for?
  const myVote = playerId && game.currentVotes[playerId] !== undefined ? game.currentVotes[playerId] : null;

  return {
    ...game,
    cards,
    currentVotes: voteSummary,
    _isSpymaster: isSpymaster,
    _playerId: playerId,
    _playerRole: player?.role ?? null,
    _playerTeam: player ? (player.role.startsWith('red') ? 'red' : 'blue') : null,
    _myVote: myVote,
    _totalOperatives: totalOps,
    _votesIn: Object.keys(game.currentVotes).length,
  };
}

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;
    const method = request.method;

    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    // Serve frontend
    if (method === 'GET' && pathname === '/') {
      return new Response(getHTML(), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // Create game
    if (method === 'POST' && pathname === '/api/create') {
      const game = createGame();
      await env.CODENAMES.put(game.roomCode, JSON.stringify(game), { expirationTtl: 86400 });
      return jsonResponse({ roomCode: game.roomCode, gameId: game.id });
    }

    // Join game (pick a role)
    if (method === 'POST' && pathname === '/api/join') {
      const body = await request.json() as { gameId: string; name: string; role: Role };
      const code = body.gameId.toUpperCase();
      const data = await env.CODENAMES.get(code);
      if (!data) return jsonResponse({ error: 'Game not found' }, 404);

      const game: GameState = JSON.parse(data);

      // Only one spymaster per team
      if ((body.role === 'red-spymaster' || body.role === 'blue-spymaster') &&
          game.players.some(p => p.role === body.role)) {
        return jsonResponse({ error: 'That spymaster role is already taken' }, 400);
      }

      const playerId = generatePlayerId();
      game.players.push({ id: playerId, name: body.name.trim() || 'Anonymous', role: body.role });

      // Auto-start when all 4 roles filled
      if (game.phase === 'lobby' && canStartGame(game.players)) {
        game.phase = 'clue';
      }

      await env.CODENAMES.put(game.roomCode, JSON.stringify(game), { expirationTtl: 86400 });
      return jsonResponse({ playerId, game: filterStateForPlayer(game, playerId) });
    }

    // Get game state (with player perspective)
    const gameMatch = pathname.match(/^\/api\/game\/([A-Za-z0-9]{4})$/);
    if (method === 'GET' && gameMatch) {
      const code = gameMatch[1].toUpperCase();
      const playerId = url.searchParams.get('playerId');
      const data = await env.CODENAMES.get(code);
      if (!data) return jsonResponse({ error: 'Game not found' }, 404);
      const game: GameState = JSON.parse(data);
      return jsonResponse(filterStateForPlayer(game, playerId));
    }

    // Give clue (spymaster only)
    if (method === 'POST' && pathname === '/api/clue') {
      const body = await request.json() as { gameId: string; playerId: string; word: string; number: number };
      const data = await env.CODENAMES.get(body.gameId.toUpperCase());
      if (!data) return jsonResponse({ error: 'Game not found' }, 404);

      const game: GameState = JSON.parse(data);
      if (game.phase !== 'clue') return jsonResponse({ error: 'Not in clue phase' }, 400);

      const player = game.players.find(p => p.id === body.playerId);
      if (!player) return jsonResponse({ error: 'Player not found' }, 400);

      const expectedRole = game.currentTeam === 'red' ? 'red-spymaster' : 'blue-spymaster';
      if (player.role !== expectedRole) return jsonResponse({ error: 'Not your turn to give a clue' }, 400);

      const clue: Clue = {
        word: body.word.trim().toUpperCase(),
        number: Math.max(0, Math.min(25, body.number)),
        team: game.currentTeam,
        guessesLeft: body.number + 1, // number + 1 bonus guess
      };

      game.currentClue = clue;
      game.clueHistory.push(clue);
      game.phase = 'guess';
      game.currentVotes = {};

      await env.CODENAMES.put(game.roomCode, JSON.stringify(game), { expirationTtl: 86400 });
      return jsonResponse(filterStateForPlayer(game, body.playerId));
    }

    // Vote/Guess (operative only — consensus required)
    if (method === 'POST' && pathname === '/api/guess') {
      const body = await request.json() as { gameId: string; playerId: string; cardIndex: number };
      const data = await env.CODENAMES.get(body.gameId.toUpperCase());
      if (!data) return jsonResponse({ error: 'Game not found' }, 404);

      const game: GameState = JSON.parse(data);
      if (game.phase !== 'guess') return jsonResponse({ error: 'Not in guess phase' }, 400);
      if (game.gameOver) return jsonResponse({ error: 'Game is over' }, 400);

      const player = game.players.find(p => p.id === body.playerId);
      if (!player) return jsonResponse({ error: 'Player not found' }, 400);

      const expectedRole = game.currentTeam === 'red' ? 'red-operative' : 'blue-operative';
      if (player.role !== expectedRole) return jsonResponse({ error: 'Not your turn to guess' }, 400);

      const card = game.cards[body.cardIndex];
      if (!card || card.revealed) return jsonResponse({ error: 'Invalid card' }, 400);

      // Record this operative's vote (can change vote by clicking different card)
      game.currentVotes[body.playerId] = body.cardIndex;

      // Check if ALL operatives on the team have voted for the SAME card
      const teamOps = getTeamOperatives(game, game.currentTeam);
      const allVoted = teamOps.every(op => game.currentVotes[op.id] !== undefined);

      if (allVoted) {
        const votes = teamOps.map(op => game.currentVotes[op.id]);
        const allAgree = votes.every(v => v === votes[0]);

        if (allAgree) {
          // Consensus reached — reveal the card
          const chosenIndex = votes[0];
          const chosenCard = game.cards[chosenIndex];
          chosenCard.revealed = true;
          game.currentVotes = {}; // Reset votes

          // Recalculate scores
          game.redScore = game.cards.filter(c => c.team === 'red' && !c.revealed).length;
          game.blueScore = game.cards.filter(c => c.team === 'blue' && !c.revealed).length;

          if (chosenCard.team === 'assassin') {
            game.gameOver = true;
            game.phase = 'over';
            game.winner = game.currentTeam === 'red' ? 'blue' : 'red';
            game.gameOverReason = game.currentTeam.toUpperCase() + ' hit the assassin!';
          } else if (chosenCard.team === game.currentTeam) {
            // Correct guess
            if ((chosenCard.team === 'red' && game.redScore === 0) || (chosenCard.team === 'blue' && game.blueScore === 0)) {
              game.gameOver = true;
              game.phase = 'over';
              game.winner = chosenCard.team;
              game.gameOverReason = chosenCard.team.charAt(0).toUpperCase() + chosenCard.team.slice(1) + ' found all their agents!';
            } else if (game.currentClue) {
              game.currentClue.guessesLeft--;
              if (game.currentClue.guessesLeft <= 0) {
                game.currentTeam = game.currentTeam === 'red' ? 'blue' : 'red';
                game.currentClue = null;
                game.phase = 'clue';
              }
            }
          } else {
            // Wrong guess (neutral or other team) — end turn
            game.currentTeam = game.currentTeam === 'red' ? 'blue' : 'red';
            game.currentClue = null;
            game.phase = 'clue';
          }
        } else {
          // All voted but no consensus — reset votes so they try again
          game.currentVotes = {};
        }
      }

      await env.CODENAMES.put(game.roomCode, JSON.stringify(game), { expirationTtl: 86400 });
      return jsonResponse(filterStateForPlayer(game, body.playerId));
    }

    // End turn (operative decides to stop guessing)
    if (method === 'POST' && pathname === '/api/end-turn') {
      const body = await request.json() as { gameId: string; playerId: string };
      const data = await env.CODENAMES.get(body.gameId.toUpperCase());
      if (!data) return jsonResponse({ error: 'Game not found' }, 404);

      const game: GameState = JSON.parse(data);
      if (game.phase !== 'guess') return jsonResponse({ error: 'Cannot end turn now' }, 400);
      if (game.gameOver) return jsonResponse({ error: 'Game is over' }, 400);

      const player = game.players.find(p => p.id === body.playerId);
      if (!player) return jsonResponse({ error: 'Player not found' }, 400);

      const expectedRole = game.currentTeam === 'red' ? 'red-operative' : 'blue-operative';
      if (player.role !== expectedRole) return jsonResponse({ error: 'Not your turn' }, 400);

      game.currentTeam = game.currentTeam === 'red' ? 'blue' : 'red';
      game.currentClue = null;
      game.phase = 'clue';
      game.currentVotes = {};

      await env.CODENAMES.put(game.roomCode, JSON.stringify(game), { expirationTtl: 86400 });
      return jsonResponse(filterStateForPlayer(game, body.playerId));
    }

    // New round
    if (method === 'POST' && pathname === '/api/new-round') {
      const body = await request.json() as { gameId: string; playerId: string };
      const data = await env.CODENAMES.get(body.gameId.toUpperCase());
      if (!data) return jsonResponse({ error: 'Game not found' }, 404);

      const oldGame: GameState = JSON.parse(data);
      const { cards, startingTeam } = createBoard();

      const newGame: GameState = {
        ...oldGame,
        cards,
        currentTeam: startingTeam,
        phase: canStartGame(oldGame.players) ? 'clue' : 'lobby',
        redScore: cards.filter(c => c.team === 'red').length,
        blueScore: cards.filter(c => c.team === 'blue').length,
        winner: null,
        gameOver: false,
        gameOverReason: null,
        currentClue: null,
        clueHistory: [],
        currentVotes: {},
      };

      await env.CODENAMES.put(newGame.roomCode, JSON.stringify(newGame), { expirationTtl: 86400 });
      return jsonResponse(filterStateForPlayer(newGame, body.playerId));
    }

    return jsonResponse({ error: 'Not found' }, 404);
  },
};
