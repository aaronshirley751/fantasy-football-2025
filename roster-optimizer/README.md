# 🏈 Fantasy Football Roster Optimizer

## Overview
An intelligent fantasy football assistant that analyzes your Sleeper league roster and provides data-driven add/drop recommendations to improve your team's performance.

## Features
- 📊 Real-time roster analysis via Sleeper API
- 🎯 Personalized add/drop recommendations
- 💰 FAAB bid strategy guidance
- 📅 Bye week planning
- 🔄 Streaming recommendations (DST, QB, TE)
- 📈 Projected points analysis
- ⚡ High-ceiling player identification

## How It Works
1. Connects to your Sleeper league using league ID
2. Analyzes your current roster and recent performance
3. Evaluates all available free agents
4. Provides 4-5 high-impact recommendations with detailed rationale
5. Includes FAAB bidding strategy and risk assessment

## Quick Start
```bash
# Run the roster optimizer
node analyze-roster.js

# Or with specific league ID
node analyze-roster.js --league 1249067741470539776
```

## Configuration
Edit `config.js` to customize:
- League settings (PPR, roster structure, etc.)
- Analysis priorities (current week vs. future weeks)
- Risk tolerance settings
- Data source preferences

## Output
The optimizer generates:
- Current roster strength/weakness analysis
- Top 4-5 add/drop recommendations with FAAB bids
- Bye week coverage plan
- Streaming options for DST/QB/TE
- Risk-adjusted projections

## Data Sources
- **Primary**: Sleeper API (league data, rosters, available players)
- **Supplementary**: ESPN, CBS, Yahoo projections (via web scraping)
- **Community**: Reddit r/fantasyfootball insights
- **Advanced**: SubvertADown for DST streaming

## Project Structure
```
roster-optimizer/
├── README.md                 # This file
├── config.js                 # Configuration settings
├── analyze-roster.js         # Main analysis script
├── lib/
│   ├── sleeper-api.js       # Sleeper API integration
│   ├── roster-analyzer.js   # Roster evaluation logic
│   ├── free-agent-scout.js  # Available player analysis
│   ├── projections.js       # Points projection engine
│   └── recommendations.js   # Add/drop recommendation generator
└── data/
    └── player-cache.json    # Cached player data
```

## Coming Soon
- 🤖 AI-powered matchup analysis
- 📱 Discord bot integration
- 📊 Trade analyzer
- 🎮 Daily lineup optimizer
- 📈 Season-long trend analysis
