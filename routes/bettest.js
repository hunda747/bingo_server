const express = require('express');
const router = express.Router();

function generateRandomNumbers() {
  const numbers = [];
  
  while (numbers.length < 20) {
    const randomNum = Math.floor(Math.random() * 80) + 1;
    
    // Ensure the number is not already in the array
    if (!numbers.includes(randomNum)) {
      numbers.push(randomNum);
    }
  }
  
  return numbers;
}

// Define routes for user-related actions
router.get('/ramdom', (req, res) => {
  const picks = generateRandomNumbers();
  
  res.json(picks);
});

// Define routes for user-related actions
router.get('/result', (req, res) => {
  const picks = generateRandomNumbers();
  
  res.json({
    openGame: {
      id: 1235,
      gameNumber: 1005
    },
    game: {
      gameNumber: 1004
    },
    result: picks,
    lastGame: 1003,
    recent: [
      {
        values: [
          4, 41, 45, 60, 80, 2, 5, 89, 60, 26, 12, 15, 18, 24, 29, 34, 32,
          37, 40, 42,
        ],
      },
    ]
  });
});

// Define routes for user-related actions
router.get('/', (req, res) => {
  const picks = generateRandomNumbers();
  
  
  res.json({
    openGame: {
      id: 1235,
      gameNumber: 1000
    },
    result: picks,
    lastGame: 999,
    recent: [
      {
        values: [
          4, 41, 45, 60, 80, 2, 5, 89, 60, 26, 12, 15, 18, 24, 29, 34, 32,
          37, 40, 42,
        ],
      },
      {
        values: [
          4, 41, 45, 60, 80, 2, 5, 89, 60, 26, 12, 15, 18, 24, 29, 34, 32,
          37, 40, 42,
        ],
      },
    ]
  });
});

module.exports = router;