// Configuration for Fantasy Football Roster Optimizer

module.exports = {
  // Your Sleeper league ID
  leagueId: '1249067741470539776',
  
  // League scoring settings
  scoring: {
    format: 'PPR', // PPR, Half-PPR, or Standard
    pointsPerReception: 1,
    pointsPerPassingTD: 4,
    pointsPerRushingTD: 6,
    pointsPerReceivingTD: 6
  },
  
  // Roster configuration
  roster: {
    qb: 1,
    rb: 2,
    wr: 2,
    te: 1,
    flex: 2, // RB/WR/TE
    dst: 1,
    bench: 6
  },
  
  // Waiver settings
  waivers: {
    type: 'FAAB', // FAAB or Rolling
    budget: 100,
    freeAddsRemaining: 10
  },
  
  // Analysis configuration
  analysis: {
    // Time horizon weights
    currentWeekWeight: 0.70,  // 70% weight on immediate impact
    futureWeeksWeight: 0.30,  // 30% weight on weeks 2-4
    weeksToAnalyze: 4,        // Analyze current week + next 3
    
    // Evaluation criteria weights
    recentPerformance: 0.30,  // Last 3 weeks actual points
    projectedPoints: 0.35,     // Expert projections
    opportunityMetrics: 0.20,  // Snap %, targets, touches
    matchupQuality: 0.15,      // Opponent defensive rankings
    
    // Player preferences
    prioritizeUpside: true,    // High ceiling over safe floor
    minProjectedDelta: 2.0,    // Minimum projected point improvement
    considerInjuries: true,    // Factor in injury status
    considerByes: true         // Plan for bye weeks
  },
  
  // Recommendation settings
  recommendations: {
    maxRecommendations: 5,
    minRecommendations: 4,
    includeFAABEstimates: true,
    includeRiskAssessment: true,
    showAlternatives: true
  },
  
  // FAAB strategy
  faabStrategy: {
    aggressiveness: 'high',    // low, medium, high
    maxBidPercentage: 0.25,    // Max 25% of budget per player
    reserveBudget: 10          // Always keep $10 for emergencies
  },
  
  // Data sources (enable/disable)
  dataSources: {
    sleeper: true,             // Primary - always enabled
    espn: true,                // ESPN projections
    cbs: true,                 // CBS Sports rankings
    yahoo: true,               // Yahoo projections
    fantasyData: true,         // FantasyData.com
    proFootballRef: true,      // Pro Football Reference stats
    reddit: true,              // r/fantasyfootball sentiment
    subvertadown: true         // DST streaming rankings
  },
  
  // Caching settings
  cache: {
    enabled: true,
    playerDataTTL: 3600,       // 1 hour in seconds
    projectionsDataTTL: 14400  // 4 hours in seconds
  },
  
  // Output formatting
  output: {
    verbose: true,
    colorized: true,
    includeGraphs: false,      // ASCII charts in terminal
    saveToFile: true,
    exportFormat: 'markdown'   // markdown, json, or text
  }
};
