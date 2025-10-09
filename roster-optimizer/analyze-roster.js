// Main roster analysis script

const SleeperAPI = require('./lib/sleeper-api');
const config = require('./config');

class RosterOptimizer {
  constructor(leagueId, userId) {
    this.leagueId = leagueId || config.leagueId;
    this.userId = userId;
    this.api = new SleeperAPI(this.leagueId);
  }

  /**
   * Run complete roster analysis
   */
  async analyze() {
    console.log('🏈 Fantasy Football Roster Optimizer');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    try {
      // Step 1: Gather league data
      console.log('📊 Step 1: Gathering league data...');
      const leagueBundle = await this.api.getLeagueBundle();
      console.log(`✅ League: ${leagueBundle.league.name}`);
      console.log(`✅ Current Week: ${leagueBundle.currentWeek}`);
      console.log(`✅ Season: ${leagueBundle.season}\n`);

      // Step 2: Get user's roster
      console.log('📋 Step 2: Analyzing your roster...');
      const userId = this.userId || await this.selectUser(leagueBundle.users);
      const enrichedRoster = await this.api.getEnrichedRoster(userId);
      console.log(`✅ Team: ${enrichedRoster.user.display_name}`);
      console.log(`✅ Record: ${enrichedRoster.roster.settings.wins}-${enrichedRoster.roster.settings.losses}`);
      console.log(`✅ Total Points: ${enrichedRoster.roster.settings.fpts.toFixed(2)}\n`);

      // Step 3: Analyze current roster
      console.log('🔍 Step 3: Evaluating roster strength...\n');
      const rosterAnalysis = this.analyzeRosterStrength(enrichedRoster);
      this.printRosterAnalysis(rosterAnalysis);

      // Step 4: Identify available players
      console.log('\n🔎 Step 4: Scouting available free agents...');
      const availablePlayers = await this.api.getAvailablePlayers();
      const topAvailable = this.rankAvailablePlayers(availablePlayers, leagueBundle.trendingAdds);
      console.log(`✅ Found ${Object.keys(availablePlayers).length} available players\n`);

      // Step 5: Generate recommendations
      console.log('💡 Step 5: Generating add/drop recommendations...\n');
      const recommendations = this.generateRecommendations(
        enrichedRoster,
        topAvailable,
        leagueBundle.currentWeek
      );

      this.printRecommendations(recommendations);

      // Step 6: Bye week planning
      console.log('\n📅 Step 6: Bye week analysis...\n');
      const byeWeekPlan = this.analyzeByeWeeks(enrichedRoster);
      this.printByeWeekPlan(byeWeekPlan);

      // Step 7: Streaming recommendations
      console.log('\n🔄 Step 7: Streaming opportunities...\n');
      const streamingOptions = this.identifyStreamingOptions(topAvailable, leagueBundle.currentWeek);
      this.printStreamingOptions(streamingOptions);

      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ Analysis complete! Good luck this week! 🏆\n');

    } catch (error) {
      console.error('❌ Error during analysis:', error.message);
      throw error;
    }
  }

  /**
   * Let user select which roster to analyze
   */
  async selectUser(users) {
    console.log('\n👥 Select your team:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.display_name}`);
    });
    
    // For now, return first user (you can enhance this with readline for interactive selection)
    return users[0].user_id;
  }

  /**
   * Analyze roster strength by position
   */
  analyzeRosterStrength(enrichedRoster) {
    const analysis = {
      qb: { players: [], strength: 'average' },
      rb: { players: [], strength: 'average' },
      wr: { players: [], strength: 'average' },
      te: { players: [], strength: 'average' },
      dst: { players: [], strength: 'average' }
    };

    // Group players by position
    enrichedRoster.players.forEach(player => {
      if (!player.fantasy_positions) return;
      
      const primaryPos = player.fantasy_positions[0].toLowerCase();
      if (analysis[primaryPos]) {
        analysis[primaryPos].players.push(player);
      }
    });

    // Assess strength (simplified - you'd use actual projections)
    Object.keys(analysis).forEach(pos => {
      const count = analysis[pos].players.length;
      if (count === 0) analysis[pos].strength = 'critical';
      else if (count < 2) analysis[pos].strength = 'weak';
      else if (count < 3) analysis[pos].strength = 'average';
      else analysis[pos].strength = 'strong';
    });

    return analysis;
  }

  /**
   * Rank available players by projected value
   */
  rankAvailablePlayers(availablePlayers, trendingAdds) {
    // Create trending set for quick lookup
    const trendingSet = new Set(trendingAdds.map(p => p.player_id));

    // Convert to array and add metrics
    const rankedPlayers = Object.entries(availablePlayers)
      .map(([id, player]) => ({
        ...player,
        id,
        isTrending: trendingSet.has(id),
        fantasyScore: this.calculateFantasyScore(player, trendingSet.has(id))
      }))
      .filter(p => p.fantasy_positions && p.fantasy_positions.length > 0)
      .sort((a, b) => b.fantasyScore - a.fantasyScore);

    return rankedPlayers;
  }

  /**
   * Calculate a fantasy value score for available players
   */
  calculateFantasyScore(player, isTrending) {
    let score = 0;

    // Base score on position
    const positionValue = {
      'QB': 10,
      'RB': 15,
      'WR': 15,
      'TE': 12,
      'K': 3,
      'DEF': 8
    };

    const primaryPos = player.fantasy_positions?.[0];
    score += positionValue[primaryPos] || 0;

    // Bonus for trending
    if (isTrending) score += 10;

    // Bonus for active status
    if (player.active) score += 5;

    // Penalty for injury
    if (player.injury_status) {
      const injuryPenalty = {
        'Out': -20,
        'Doubtful': -15,
        'Questionable': -5,
        'Probable': -2
      };
      score += injuryPenalty[player.injury_status] || 0;
    }

    return score;
  }

  /**
   * Generate top add/drop recommendations
   */
  generateRecommendations(enrichedRoster, topAvailable, currentWeek) {
    const recommendations = [];
    const positionsToTarget = ['RB', 'WR', 'TE', 'QB'];

    positionsToTarget.forEach(position => {
      // Find best available at position
      const bestAvailable = topAvailable
        .filter(p => p.fantasy_positions?.includes(position))
        .slice(0, 3);

      // Find droppable players on roster
      const droppablePlayers = enrichedRoster.bench
        .filter(p => p.fantasy_positions?.includes(position))
        .sort((a, b) => {
          // Sort by perceived value (simplified)
          return (a.fantasy_positions?.length || 0) - (b.fantasy_positions?.length || 0);
        });

      if (bestAvailable.length > 0 && droppablePlayers.length > 0) {
        recommendations.push({
          priority: recommendations.length + 1,
          add: bestAvailable[0],
          drop: droppablePlayers[0],
          faabBid: this.calculateFAABBid(bestAvailable[0]),
          rationale: this.generateRationale(bestAvailable[0], droppablePlayers[0]),
          riskLevel: this.assessRisk(bestAvailable[0])
        });
      }
    });

    return recommendations.slice(0, config.recommendations.maxRecommendations);
  }

  /**
   * Calculate suggested FAAB bid
   */
  calculateFAABBid(player) {
    if (!player.isTrending) return 'FREE ADD';
    
    const baseValue = {
      'QB': 5,
      'RB': 15,
      'WR': 12,
      'TE': 8,
      'DEF': 3
    };

    const bid = baseValue[player.fantasy_positions[0]] || 5;
    return `$${bid}`;
  }

  /**
   * Generate rationale for recommendation
   */
  generateRationale(addPlayer, dropPlayer) {
    const reasons = [];
    
    if (addPlayer.isTrending) {
      reasons.push('🔥 Trending heavily in waiver activity');
    }
    
    if (addPlayer.injury_status === null && dropPlayer.injury_status) {
      reasons.push('✅ Healthy vs injured player');
    }

    if (addPlayer.fantasy_positions.length < dropPlayer.fantasy_positions.length) {
      reasons.push('📈 More position flexibility');
    }

    return reasons.join('\n   ');
  }

  /**
   * Assess risk level of adding a player
   */
  assessRisk(player) {
    if (player.injury_status) return 'HIGH';
    if (player.years_exp < 2) return 'MEDIUM';
    if (!player.isTrending) return 'LOW';
    return 'MEDIUM';
  }

  /**
   * Analyze upcoming bye weeks
   */
  analyzeByeWeeks(enrichedRoster) {
    const byeWeeks = {};
    
    enrichedRoster.players.forEach(player => {
      if (player.bye_week) {
        if (!byeWeeks[player.bye_week]) {
          byeWeeks[player.bye_week] = [];
        }
        byeWeeks[player.bye_week].push(player);
      }
    });

    return byeWeeks;
  }

  /**
   * Identify streaming opportunities
   */
  identifyStreamingOptions(topAvailable, currentWeek) {
    return {
      dst: topAvailable.filter(p => p.fantasy_positions?.includes('DEF')).slice(0, 3),
      qb: topAvailable.filter(p => p.fantasy_positions?.includes('QB')).slice(0, 3),
      te: topAvailable.filter(p => p.fantasy_positions?.includes('TE')).slice(0, 3)
    };
  }

  // === PRINTING FUNCTIONS ===

  printRosterAnalysis(analysis) {
    console.log('📊 POSITION-BY-POSITION BREAKDOWN:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    Object.entries(analysis).forEach(([position, data]) => {
      const strengthEmoji = {
        'critical': '🔴',
        'weak': '🟡',
        'average': '🟢',
        'strong': '💪'
      };
      
      console.log(`\n${position.toUpperCase()}: ${strengthEmoji[data.strength]} ${data.strength.toUpperCase()}`);
      console.log(`Players (${data.players.length}):`);
      data.players.slice(0, 5).forEach(player => {
        const injury = player.injury_status ? ` [${player.injury_status}]` : '';
        console.log(`  • ${player.first_name} ${player.last_name} (${player.team || 'FA'})${injury}`);
      });
    });
  }

  printRecommendations(recommendations) {
    console.log('💡 TOP ADD/DROP RECOMMENDATIONS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    recommendations.forEach(rec => {
      console.log(`\n🎯 PRIORITY ${rec.priority}:`);
      console.log(`ADD: ${rec.add.first_name} ${rec.add.last_name} - ${rec.add.fantasy_positions[0]} - ${rec.add.team || 'FA'}`);
      console.log(`DROP: ${rec.drop.first_name} ${rec.drop.last_name} - ${rec.drop.fantasy_positions[0]} - ${rec.drop.team || 'FA'}`);
      console.log(`\nFAAB BID: ${rec.faabBid}`);
      console.log(`\nRATIONALE:`);
      console.log(`   ${rec.rationale}`);
      console.log(`\nRISK LEVEL: ${rec.riskLevel}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });
  }

  printByeWeekPlan(byeWeeks) {
    console.log('📅 BYE WEEK SCHEDULE:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const sortedWeeks = Object.keys(byeWeeks).sort((a, b) => Number(a) - Number(b));
    
    if (sortedWeeks.length === 0) {
      console.log('✅ No upcoming bye weeks!');
    } else {
      sortedWeeks.forEach(week => {
        console.log(`\nWeek ${week}:`);
        byeWeeks[week].forEach(player => {
          console.log(`  • ${player.first_name} ${player.last_name} (${player.fantasy_positions[0]})`);
        });
      });
    }
  }

  printStreamingOptions(options) {
    console.log('🔄 STREAMING OPPORTUNITIES:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    ['dst', 'qb', 'te'].forEach(pos => {
      console.log(`\n${pos.toUpperCase()} Options:`);
      if (options[pos].length === 0) {
        console.log('  No strong options available');
      } else {
        options[pos].forEach((player, index) => {
          const trending = player.isTrending ? ' 🔥' : '';
          console.log(`  ${index + 1}. ${player.first_name} ${player.last_name} (${player.team || 'FA'})${trending}`);
        });
      }
    });
  }
}

// Run the analyzer
async function main() {
  const args = process.argv.slice(2);
  const leagueId = args.find(arg => arg.startsWith('--league='))?.split('=')[1];
  const userId = args.find(arg => arg.startsWith('--user='))?.split('=')[1];

  const optimizer = new RosterOptimizer(leagueId, userId);
  await optimizer.analyze();
}

// Execute if run directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = RosterOptimizer;
