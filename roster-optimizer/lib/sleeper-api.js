// Sleeper API integration module

const SLEEPER_BASE_URL = 'https://api.sleeper.app/v1';
const RATE_LIMIT = 1000; // 1000 requests per minute

class SleeperAPI {
  constructor(leagueId) {
    this.leagueId = leagueId;
    this.requestQueue = [];
  }

  /**
   * Fetch league information
   */
  async getLeague() {
    const response = await fetch(`${SLEEPER_BASE_URL}/league/${this.leagueId}`);
    if (!response.ok) throw new Error(`Failed to fetch league: ${response.status}`);
    return await response.json();
  }

  /**
   * Get all rosters in the league
   */
  async getRosters() {
    const response = await fetch(`${SLEEPER_BASE_URL}/league/${this.leagueId}/rosters`);
    if (!response.ok) throw new Error(`Failed to fetch rosters: ${response.status}`);
    return await response.json();
  }

  /**
   * Get all users in the league
   */
  async getUsers() {
    const response = await fetch(`${SLEEPER_BASE_URL}/league/${this.leagueId}/users`);
    if (!response.ok) throw new Error(`Failed to fetch users: ${response.status}`);
    return await response.json();
  }

  /**
   * Get matchups for a specific week
   */
  async getMatchups(week) {
    const response = await fetch(`${SLEEPER_BASE_URL}/league/${this.leagueId}/matchups/${week}`);
    if (!response.ok) throw new Error(`Failed to fetch matchups: ${response.status}`);
    return await response.json();
  }

  /**
   * Get all NFL players (cached)
   */
  async getAllPlayers() {
    const response = await fetch(`${SLEEPER_BASE_URL}/players/nfl`);
    if (!response.ok) throw new Error(`Failed to fetch players: ${response.status}`);
    return await response.json();
  }

  /**
   * Get current NFL state (week, season)
   */
  async getNFLState() {
    const response = await fetch(`${SLEEPER_BASE_URL}/state/nfl`);
    if (!response.ok) throw new Error(`Failed to fetch NFL state: ${response.status}`);
    return await response.json();
  }

  /**
   * Get transactions for a specific week
   */
  async getTransactions(week) {
    const response = await fetch(`${SLEEPER_BASE_URL}/league/${this.leagueId}/transactions/${week}`);
    if (!response.ok) throw new Error(`Failed to fetch transactions: ${response.status}`);
    return await response.json();
  }

  /**
   * Get trending players (adds/drops)
   */
  async getTrendingPlayers(type = 'add', lookbackHours = 24, limit = 25) {
    const response = await fetch(
      `${SLEEPER_BASE_URL}/players/nfl/trending/${type}?lookback_hours=${lookbackHours}&limit=${limit}`
    );
    if (!response.ok) throw new Error(`Failed to fetch trending players: ${response.status}`);
    return await response.json();
  }

  /**
   * Get user's roster by user ID
   */
  async getUserRoster(userId) {
    const rosters = await this.getRosters();
    const users = await this.getUsers();
    
    // Find the user
    const user = users.find(u => u.user_id === userId || u.display_name === userId);
    if (!user) throw new Error(`User not found: ${userId}`);
    
    // Find their roster
    const roster = rosters.find(r => r.owner_id === user.user_id);
    if (!roster) throw new Error(`Roster not found for user: ${userId}`);
    
    return { user, roster };
  }

  /**
   * Get available free agents (not on any roster)
   */
  async getAvailablePlayers() {
    const [rosters, allPlayers] = await Promise.all([
      this.getRosters(),
      this.getAllPlayers()
    ]);

    // Get all rostered player IDs
    const rosteredPlayerIds = new Set();
    rosters.forEach(roster => {
      if (roster.players) {
        roster.players.forEach(playerId => rosteredPlayerIds.add(playerId));
      }
    });

    // Filter to available players only
    const availablePlayers = {};
    Object.entries(allPlayers).forEach(([playerId, player]) => {
      if (!rosteredPlayerIds.has(playerId) && player.active && player.fantasy_positions) {
        availablePlayers[playerId] = player;
      }
    });

    return availablePlayers;
  }

  /**
   * Get player stats for recent weeks
   */
  async getPlayerStats(playerId, weeks = 3) {
    // Note: Sleeper doesn't provide stats directly, you'd need to aggregate from matchups
    // This is a placeholder for the structure
    const stats = [];
    const nflState = await this.getNFLState();
    const currentWeek = nflState.week;

    for (let i = 0; i < weeks; i++) {
      const week = currentWeek - i - 1;
      if (week < 1) break;
      
      // Get matchup data for this week
      const matchups = await this.getMatchups(week);
      
      // Find player's stats in matchups
      const playerStats = this.extractPlayerStatsFromMatchups(matchups, playerId);
      if (playerStats) {
        stats.push({ week, ...playerStats });
      }
    }

    return stats;
  }

  /**
   * Helper to extract player stats from matchup data
   */
  extractPlayerStatsFromMatchups(matchups, playerId) {
    for (const matchup of matchups) {
      if (matchup.players && matchup.players.includes(playerId)) {
        return {
          points: matchup.players_points?.[playerId] || 0,
          projectedPoints: matchup.projected_points?.[playerId] || 0
        };
      }
    }
    return null;
  }

  /**
   * Get comprehensive league data bundle
   */
  async getLeagueBundle() {
    const [league, rosters, users, nflState, trendingAdds] = await Promise.all([
      this.getLeague(),
      this.getRosters(),
      this.getUsers(),
      this.getNFLState(),
      this.getTrendingPlayers('add', 24, 50)
    ]);

    return {
      league,
      rosters,
      users,
      nflState,
      trendingAdds,
      currentWeek: nflState.week,
      season: nflState.season
    };
  }

  /**
   * Get roster with player details enriched
   */
  async getEnrichedRoster(userId) {
    const { user, roster } = await this.getUserRoster(userId);
    const allPlayers = await this.getAllPlayers();

    // Enrich roster players with full player data
    const enrichedPlayers = roster.players.map(playerId => ({
      id: playerId,
      ...allPlayers[playerId]
    }));

    return {
      user,
      roster,
      players: enrichedPlayers,
      starters: roster.starters.map(playerId => ({
        id: playerId,
        ...allPlayers[playerId]
      })),
      bench: roster.players
        .filter(playerId => !roster.starters.includes(playerId))
        .map(playerId => ({
          id: playerId,
          ...allPlayers[playerId]
        }))
    };
  }
}

module.exports = SleeperAPI;
