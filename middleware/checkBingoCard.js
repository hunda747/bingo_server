function isWinner(cardData, drawnNumbers) {
  let horizontalCount = 0;
  let verticalCount = 0;
  let mainDiagonalCount = 0;
  let secondaryDiagonalCount = 0;
  // console.log('drawn number', drawnNumbers.sort((a, b) => a - b));

  // Check horizontal lines
  for (let row of Object.values(cardData)) {
    let markedCount = 0;
    for (let num of row) {
      if (drawnNumbers.includes(num) || (num === null && row[2] === null && drawnNumbers.includes(row[0]) && drawnNumbers.includes(row[4]))) {
        markedCount++;
      }
    }
    if (markedCount === 5) {
      horizontalCount++;
      if (horizontalCount >= 2) {
        return true;
      }
    }
  }

  // Check vertical lines
  for (let col = 0; col < 5; col++) {
    let markedCount = 0;
    for (let letter of Object.keys(cardData)) {
      let num = cardData[letter][col];
      if (drawnNumbers.includes(num) || (col === 2 && num === null && cardData['N'][2] === null && drawnNumbers.includes(cardData['B'][2]) && drawnNumbers.includes(cardData['O'][2]))) {
        markedCount++;
      }
    }
    if (markedCount === 5) {
      verticalCount++;
      if (verticalCount >= 2) {
        return true;
      }
    }
  }

  // Check main diagonal (top-left to bottom-right)
  if (drawnNumbers.includes(cardData['B'][0]) &&
    drawnNumbers.includes(cardData['I'][1]) &&
    //   drawnNumbers.includes(cardData['N'][2]) &&
    drawnNumbers.includes(cardData['G'][3]) &&
    drawnNumbers.includes(cardData['O'][4])) {
    mainDiagonalCount++;
    if (mainDiagonalCount >= 2) {
      return true;
    }
  }

  // Check secondary diagonal (top-right to bottom-left)
  if (drawnNumbers.includes(cardData['B'][4]) &&
    drawnNumbers.includes(cardData['I'][3]) &&
    drawnNumbers.includes(cardData['G'][1]) &&
    drawnNumbers.includes(cardData['O'][0])) {
    secondaryDiagonalCount++;
    if (secondaryDiagonalCount >= 2) {
      return true;
    }
  }
  console.log('hor', horizontalCount)
  console.log('ver', verticalCount)
  console.log('dia: ', mainDiagonalCount, ' : ', secondaryDiagonalCount)

  console.log('sum', (horizontalCount + verticalCount + mainDiagonalCount + secondaryDiagonalCount))
  // Check for combinations (horizontal + vertical, diagonal + vertical, etc.)
  if (parseInt(horizontalCount + verticalCount + mainDiagonalCount + secondaryDiagonalCount) >= 2) {
    return true;
  }

  // No winning condition met
  return false;
}

// Example usage
const cardData = {
  "B": [5, 10, 12, 7, 1],
  "I": [16, 18, 20, 23, 24],
  "N": [36, 39, null, 42, 44], // Free center space marked as null
  "G": [55, 52, 48, 50, 54],
  "O": [70, 68, 64, 61, 75]
};

const drawnNumbers = [5, 10, 12, 7, 1, 16, 18, 20, 23, 50, 24]; // Sample drawn numbers

// console.log(isWinner(cardData, drawnNumbers)); // Output: true (this card is a winner with 1 horizontal and 1 vertical line)
module.exports = { isWinner };