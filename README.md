# Danes Poker App

Live Deployment: [dane-poker](https://dane-poker.web.app/)

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test a`

Runs all the tests for hand calculations.

### `emulators:exec`

Runs the emulators tests for security rules:  
`firebase emulators:exec "npx jest security-rules-failure.test.js"`  
`firebase emulators:exec "npx jest security-rules.test.js"`  

### `npm run build`  

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

### `firebase deploy`  

Updates the live firebase deployment with the latest build.

# Insructions for players

### Register an account or use a test account

Test accounts have been made already, feel free to use any of these accounts:    

email: jane@email.com  
password: janepass  

email: sally@email.com  
password: sallypass  

email: bob@email.com  
password: bobpass  

### Creating a Game

Once you click the create game button on a logged in user that user is now the game creator for that game.  
The game creator will only be able to start the game when more than 2 players have joined the game.  
The game creator can join their own game as a player.  
All games created by users will be visible for all other logged in users, they will all also be able to join the game.  
No more than 5 players can join a single game.  
Once the game creator starts a game the status is updated to "started" while the game is in progress and no other players can join.  
Once the game is over the game will be deleted from the lobby.

### Playing a Game

Once a game has started the game creator can click the deal button, thus dealing a 5 card hand to each player in the game.  
Each player will have 1 turn each to either replace some cards in their hand or pass the turn to the next player.  
Once all the players have taken a turn the hand is evaluated and assigned a hand strength.  
The winner will be determined by which player has the highest hand strength value.  
If the top hand strength values match its considered a draw.  
After the winner has been determined players can exit the game and will be navigated back to the lobby.  

# Example Gameplay

https://github.com/BIT-Advanced-App-Dev/project-23s1-DaneS25/assets/71624904/cc3e9808-40dd-490a-ab5b-a3ab7ba5d652


