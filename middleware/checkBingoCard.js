const { Option } = require("./gameOption");

function isWinner(cardData, drawnNumbers, gameType) {
  console.log("card", cardData);
  console.log("drawNumbers", drawnNumbers);
  console.log("option", gameType);
  const line = Option[gameType] || 2;
  console.log("option: ", line);
  const { horizontalCount, verticalCount, mainDiagonalCount, secondaryDiagonalCount } = getWinningRows(cardData, drawnNumbers, line)
  // Check for combinations (horizontal + vertical, diagonal + vertical, etc.)
  if (parseInt(horizontalCount + verticalCount + mainDiagonalCount + secondaryDiagonalCount) >= line) {
    return true;
  }

  // No winning condition met
  return false;
}

const getWinningRows = (cardData, drawnNumbers, line) => {
  console.log("line", line);
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
      if (horizontalCount >= line) {
        return { horizontalCount, verticalCount, mainDiagonalCount, secondaryDiagonalCount }
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
      if (verticalCount >= line) {
        return { horizontalCount, verticalCount, mainDiagonalCount, secondaryDiagonalCount }
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
    if (mainDiagonalCount >= line) {
      return { horizontalCount, verticalCount, mainDiagonalCount, secondaryDiagonalCount }
    }
  }

  // Check secondary diagonal (top-right to bottom-left)
  if (drawnNumbers.includes(cardData['B'][4]) &&
    drawnNumbers.includes(cardData['I'][3]) &&
    drawnNumbers.includes(cardData['G'][1]) &&
    drawnNumbers.includes(cardData['O'][0])) {
    secondaryDiagonalCount++;
    if (secondaryDiagonalCount >= line) {
      return { horizontalCount, verticalCount, mainDiagonalCount, secondaryDiagonalCount }
    }
  }
  console.log('hor', horizontalCount)
  console.log('ver', verticalCount)
  console.log('dia: ', mainDiagonalCount, ' : ', secondaryDiagonalCount)

  console.log('sum', (horizontalCount + verticalCount + mainDiagonalCount + secondaryDiagonalCount))

  return { horizontalCount, verticalCount, mainDiagonalCount, secondaryDiagonalCount }
}

// console.log(isWinner(cardData, drawnNumbers)); // Output: true (this card is a winner with 1 horizontal and 1 vertical line)
module.exports = { isWinner };