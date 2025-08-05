# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a React TypeScript application for League of Legends team composition automation.

## Key Features
- Lane-based team composition (Top, Jungle, Mid, ADC, Support)
- Rank filtering for each lane
- Time-based player selection filtering
- Automatic team formation based on specified criteria

## Technical Guidelines
- Use TypeScript for type safety
- Follow React best practices with functional components and hooks
- Use modern ES6+ features
- Implement responsive design principles
- Consider accessibility in UI components

## League of Legends Context
- 5 lanes: Top, Jungle, Mid, ADC (Bot), Support
- Rank system: Iron, Bronze, Silver, Gold, Platinum, Diamond, Master, Grandmaster, Challenger
- Each lane requires exactly one player
- Player data should include: username, rank, lane preference, last activity timestamp
