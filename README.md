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

Updates the live firebase deployment with the latest build
