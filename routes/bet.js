// routes/userRoutes.js
const express = require('express');
const router = express.Router();

const getRandomIntInclusive = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function generateRandomNumbers(min, max, count) {
  const randomNumbers = [];
  while (randomNumbers.length < count) {
    const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
    if (!randomNumbers.includes(randomNum)) {
      randomNumbers.push(randomNum);
    }
  }
  return randomNumbers;
}

function applyHouseEdge(matchingNumbers, winningProbability) {
  // Adjust the probability of winning based on the house edge
  const adjustedProbability = Math.random() > winningProbability;
  return adjustedProbability ? [] : matchingNumbers;
}

function playKeno() {
  const selectedNumbers = [2, 5, 15, 36, 24, 48];
  const numberOfPicks = selectedNumbers.length;

  // Ensure all selected numbers are within the valid range
  if (selectedNumbers.some(num => num < 1 || num > 80)) {
    alert("Please enter valid numbers between 1 and 80.");
    return;
  }

  const winningProbability = 0.8; // Adjust this to control the house edge

  const drawnNumbers = generateRandomNumbers(1, 80, 20);

  // console.log("Drawn numbers: " + drawnNumbers.join(', '));

  const matchingNumbers = selectedNumbers.filter(num => drawnNumbers.includes(num));

  // Apply house edge
  const adjustedMatchingNumbers = applyHouseEdge(matchingNumbers, winningProbability);

  console.log("Your selected numbers: " + selectedNumbers.join(', '));
  // console.log("Matching numbers: " + adjustedMatchingNumbers.join(', '));

  console.log("Number of matches: " + adjustedMatchingNumbers.length);
}

function applyHouseEdgePlus(drawnNumbers, winningProbability) {
  // Apply house edge directly to the values of drawn numbers
  const adjustedDrawnNumbers = drawnNumbers.map(num => (Math.random() > winningProbability) ? num : Math.floor(Math.random() * 80) + 1);
  return adjustedDrawnNumbers;
}

function playMulitKeno(players) {
  const numberOfPicks = 5; // Number of picks per player
  const winningProbability = 0.2; // Adjust this to control the house edge


  const drawnNumbers = generateRandomNumbers(1, 80, 20);
  console.log("Drawn numbers:", drawnNumbers);

  const adjustedDrawnNumbers = applyHouseEdgePlus(drawnNumbers, winningProbability);
  console.log("Drawn numbers Adjusted:", adjustedDrawnNumbers);


  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    const matchingNumbers = player.numbers.filter(num => adjustedDrawnNumbers.includes(num));

    // Apply house edge
    // const adjustedMatchingNumbers = applyHouseEdge(matchingNumbers, winningProbability);

    console.log(`Player ${i + 1} selected numbers: ${player.numbers.join(', ')}`);
    console.log(`Matching numbers: ${matchingNumbers.join(', ')}`);
    // console.log(`Matching numbers: ${adjustedMatchingNumbers.join(', ')}`);
    console.log(`Number of matches: ${matchingNumbers.length}`);
  }
}
const playersData = [
  { numbers: [2, 5, 10, 23, 45] },
  { numbers: [7, 12, 35, 40, 78] },
  { numbers: [9, 14, 26, 58, 47] },
  { numbers: [25, 36, 24, 58, 17] },
  { numbers: [3, 26, 24, 69, 78] },
  { numbers: [7, 69, 58, 14, 26] },
  { numbers: [14, 36, 58, 47, 14] },
  // Add more players as needed
];

// Define routes for user-related actions
router.get('/', (req, res) => {
  const picks = [];
  playMulitKeno(playersData);
  while (picks.length < 20) {
    const pick = getRandomIntInclusive(1, 80);
    if (!picks.includes(pick)) picks.push(pick);
  }
  res.send(picks);
});

module.exports = router;

// Example players with various selections and stakes
const players = [
  { selectedNumbers: [4, 5], coinsPlaced: 10 },
  { selectedNumbers: [3], coinsPlaced: 20 },
  { selectedNumbers: [1, 3, 5], coinsPlaced: 100 },
  { selectedNumbers: [3], coinsPlaced: 20 },
  { selectedNumbers: [4, 2], coinsPlaced: 10 },
  { selectedNumbers: [3], coinsPlaced: 20 },
  { selectedNumbers: [6, 5], coinsPlaced: 10 },
  { selectedNumbers: [1], coinsPlaced: 20 },
  // ... other players
];

function drawTwoUniqueNumbers(weights, num) {
  const drawnNumbers = new Set();
  console.log('weight', weights)
  while (drawnNumbers.size < num) {
    const candidateNumber = weightedRandom(weights);
    if (!drawnNumbers.has(candidateNumber)) {
      drawnNumbers.add(candidateNumber);
    }
  }
  return Array.from(drawnNumbers).sort(); // Ensure sorted order
}

function weightedRandom(weights) {
  const totalWeight = weights.reduce((sum, weight) => sum + weight.weight, 0);
  const randomValue = Math.random() * totalWeight;

  let cumulativeWeight = 0;
  for (let i = 0; i < weights.length; i++) {
    cumulativeWeight += weights[i].weight;
    if (randomValue <= cumulativeWeight) {
      return weights[i].value; // Return the selected number
    }
  }
}

function calculateWeights(players) {
  // Create an array to store all possible numbers
  const allNumbers = Array.from({ length: 6 }, (_, i) => i + 1); // [1, 2, 3, 4, 5, 6]

  // Initialize empty object to store total coins placed
  const coinsSum = {};

  // Iterate through players and count their bets
  players.forEach(player => {
    player.selectedNumbers.forEach(number => {
      coinsSum[number] = (coinsSum[number] || 0) + player.coinsPlaced / player.selectedNumbers.length;
    });
  });

  // Calculate total coins placed
  const totalCoinsPlaced = Object.values(coinsSum).reduce((sum, value) => sum + value, 0);

  // Calculate base weight (average coins placed per number)
  const baseWeight = totalCoinsPlaced / allNumbers.length;

  // Return weights for all numbers
  return allNumbers.map(number => ({
    value: number,
    weight: coinsSum[number] ? baseWeight / coinsSum[number] : baseWeight, // Lower weight for selected numbers
  }));
}

function simulateGame(players, numDrawnNumbers = 2) {
  const weights = calculateWeights(players);

  // Draw the specified number of unique numbers
  const drawnNumbers = drawTwoUniqueNumbers(weights, numDrawnNumbers);

  let totalCoinsPlaced = 0;
  let totalWinnings = 0;

  // Calculate winnings for each player
  players.forEach(player => {
    // Check for matching numbers using a counter
    let matchingNumbers = 0;
    for (const drawnNumber of drawnNumbers) {
      if (player.selectedNumbers.includes(drawnNumber)) {
        matchingNumbers++;
      }
    }

    // Calculate winning odd based on number of matches
    const odd = {
      1: [{ 1: 2 }],
      2: [{ 1: 0 }, { 2: 2 }],
      3: [{ 1: 0 }, { 2: 1 }, { 3: 4 }],
    };
    // console.log('ppu', odd[numDrawnNumbers][matchingNumbers - 1])

    const nestedArray = odd[player.selectedNumbers.length];
    const nestedObject = nestedArray && nestedArray[matchingNumbers - 1];

    // Check if the object exists and has the desired key
    const value = nestedObject && nestedObject[matchingNumbers];
    const winningOdd = value !== undefined ? value : 0;

    // const winningOdd = odd[numDrawnNumbers]?.[matchingNumbers - 1]?.[1] || 0;
    // Use default of 0 for missing entries
    // console.log('odd', winningOdd)
    // Assign winnings based on winning odd
    player.winnings = player.coinsPlaced * winningOdd;

    totalWinnings += player.winnings;
    totalCoinsPlaced += player.coinsPlaced;
  });

  return { drawnNumbers, totalCoinsPlaced, totalWinnings };
}

// // Simulate the game and get the result
// const gameResult = simulateGame(players, 3);

// // Display the result and player details
// console.log(`Drawn Numbers: ${gameResult.drawnNumbers.join(', ')}`);
// console.log(`Total Coins Placed: ${gameResult.totalCoinsPlaced}`);
// console.log(`Total Winnings: ${gameResult.totalWinnings}`);
// console.log(`Total Net: ${gameResult.totalCoinsPlaced - gameResult.totalWinnings}`);
// players.forEach((player, index) => {
//   console.log(`Player ${index + 1}: Selected ${player.selectedNumbers}, Placed Bet ${player.coinsPlaced}, Winnings ${player.winnings}, Net ${player.winnings - player.coinsPlaced}`);
// });
