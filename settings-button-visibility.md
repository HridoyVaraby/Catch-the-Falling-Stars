# Settings Button Visibility Management

## Overview
This document describes the implementation to hide the settings button during gameplay and only show it on the home screen, as requested.

## Changes Made

### 1. HTML Modification
In [index.html](file://d%3A/Work/Node%20Projects/Game/Catch%20the%20Falling%20Stars/index.html), added an ID to the settings button for easier manipulation:

```html
<a href="settings.html" id="settingsButton" class="settings-button" title="Game Settings" aria-label="Open game settings">
```

### 2. JavaScript Implementation
In [game.js](file://d%3A/Work/Node%20Projects/Game/Catch%20the%20Falling%20Stars/game.js), several changes were made:

#### a. Added Settings Button Reference
```javascript
const settingsButton = document.getElementById('settingsButton'); // Added settings button reference
```

#### b. Hide Settings Button on Game Start
In the [startGame()](file://d%3A/Work/Node%20Projects/Game/Catch%20the%20Falling%20Stars/game.js#L301-L320) function:
```javascript
// Hide settings button when game starts
settingsButton.classList.add('hidden');
```

#### c. Show Settings Button on Game End
In the [endGame()](file://d%3A/Work/Node%20Projects/Game/Catch%20the%20Falling%20Stars/game.js#L283-L299) function:
```javascript
// Show settings button when game ends
settingsButton.classList.remove('hidden');
```

#### d. Show Settings Button on Return to Home
In the home button event listener:
```javascript
// Show settings button when returning to home screen
settingsButton.classList.remove('hidden');
```

## Behavior
1. **Home Screen**: Settings button is visible
2. **Gameplay**: Settings button is hidden
3. **Game Over Screen**: Settings button is visible again
4. **Return to Home**: Settings button is visible

## Technical Details
- Uses the existing `.hidden` CSS class to control visibility
- Maintains accessibility by not removing the element from the DOM
- Follows the existing game state management patterns

## Testing
To test the implementation:
1. Open the game and verify the settings button is visible on the home screen
2. Start the game and confirm the settings button is hidden during gameplay
3. End the game (either by losing or manually) and verify the settings button reappears
4. Return to the home screen and confirm the settings button is visible