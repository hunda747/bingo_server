const { Option } = require("./gameOption");

function isWinner(cardData, drawnNumbers, gameType) {
  // console.log("card", cardData);
  // console.log("drawNumbers", drawnNumbers);
  // console.log("option", gameType);
  const pattern = "corner";
  console.log('gameType', gameType);

  // Check which pattern to validate
  switch (gameType) {
    case 'Line1' || 'Line2' || 'Line3':
      return checkLines(cardData, drawnNumbers, gameType);
    case 'tshape':
      return checkTShape(cardData, drawnNumbers);
    case 'xshape':
      return checkXShape(cardData, drawnNumbers);
    case 'hshape':
      return checkHShape(cardData, drawnNumbers);
    case 'ushape':
      return checkUShape(cardData, drawnNumbers);
    case 'star':
      return checkStarShape(cardData, drawnNumbers);
    case 'corner':
      return checkCornerShape(cardData, drawnNumbers);
    default:
      return checkLines(cardData, drawnNumbers, gameType);
  }
}

function checkLines(cardData, drawnNumbers, gameType) {
  const line = Option[gameType];
  const { horizontalCount, verticalCount, mainDiagonalCount, secondaryDiagonalCount } = getWinningRows(cardData, drawnNumbers, line);

  // Check for combinations
  if (parseInt(horizontalCount + verticalCount + mainDiagonalCount + secondaryDiagonalCount) >= line) {
    return true;
  }
  return false;
}

function checkTShape(cardData, drawnNumbers) {
  // Check top row (first number from each column)
  let topRowComplete = true;
  for (let letter of ['B', 'I', 'N', 'G', 'O']) {
    let num = cardData[letter][0];
    if (!drawnNumbers.includes(num)) {
      topRowComplete = false;
      break;
    }
  }

  // Check middle vertical column (N column)
  let middleColumnComplete = true;
  for (let i = 1; i < 5; i++) {
    let num = cardData['N'][i];
    // Account for free space in the middle
    if (!drawnNumbers.includes(num) && !(i === 2 && num === null)) {
      middleColumnComplete = false;
      break;
    }
  }

  // T-shape is complete if both top row and middle column are marked
  return topRowComplete && middleColumnComplete;
}

function checkXShape(cardData, drawnNumbers) {
  const letters = ['B', 'I', 'N', 'G', 'O'];

  // Check main diagonal (top-left to bottom-right)
  let mainDiagonalComplete = true;
  for (let i = 0; i < 5; i++) {
    let num = cardData[letters[i]][i];
    // Account for free space in the middle
    if (!drawnNumbers.includes(num) && !(i === 2 && num === null)) {
      mainDiagonalComplete = false;
      break;
    }
  }

  // Check secondary diagonal (top-right to bottom-left)
  let secondaryDiagonalComplete = true;
  for (let i = 0; i < 5; i++) {
    let num = cardData[letters[i]][4 - i];
    // Account for free space in the middle
    if (!drawnNumbers.includes(num) && !(i === 2 && num === null)) {
      secondaryDiagonalComplete = false;
      break;
    }
  }

  // X-shape is complete if both diagonals are marked
  return mainDiagonalComplete && secondaryDiagonalComplete;
}

function checkHShape(cardData, drawnNumbers) {
  // Check left vertical column (B column)
  let leftColumnComplete = true;
  for (let i = 0; i < 5; i++) {
    let num = cardData['B'][i];
    if (!drawnNumbers.includes(num)) {
      leftColumnComplete = false;
      break;
    }
  }

  // Check right vertical column (O column)
  let rightColumnComplete = true;
  for (let i = 0; i < 5; i++) {
    let num = cardData['O'][i];
    if (!drawnNumbers.includes(num)) {
      rightColumnComplete = false;
      break;
    }
  }

  // Check middle row (row 2, which contains the free space)
  let middleRowComplete = true;
  for (let letter of ['B', 'I', 'N', 'G', 'O']) {
    let num = cardData[letter][2];
    // Account for free space in the middle
    if (!drawnNumbers.includes(num) && !(letter === 'N' && num === null)) {
      middleRowComplete = false;
      break;
    }
  }

  // H-shape is complete if both vertical columns and middle row are marked
  return leftColumnComplete && rightColumnComplete && middleRowComplete;
}

function checkStarShape(cardData, drawnNumbers) {
  // First row - check N only
  if (!drawnNumbers.includes(cardData['N'][0])) {
    return false;
  }

  // Second row - check all positions
  for (let letter of ['B', 'I', 'N', 'G', 'O']) {
    if (!drawnNumbers.includes(cardData[letter][1])) {
      return false;
    }
  }

  // Third row - check N only
  if (!drawnNumbers.includes(cardData['N'][2]) && cardData['N'][2] !== null) {
    return false;
  }

  // Fourth row - check I and G only
  if (!drawnNumbers.includes(cardData['I'][3]) ||
    !drawnNumbers.includes(cardData['G'][3])) {
    return false;
  }

  // Fifth row - check B and O only
  if (!drawnNumbers.includes(cardData['B'][4]) ||
    !drawnNumbers.includes(cardData['O'][4])) {
    return false;
  }

  return true;
}

function checkUShape(cardData, drawnNumbers) {
  // Check left vertical column (B column)
  let leftColumnComplete = true;
  for (let i = 0; i < 5; i++) {
    let num = cardData['B'][i];
    if (!drawnNumbers.includes(num)) {
      leftColumnComplete = false;
      break;
    }
  }

  // Check right vertical column (O column)
  let rightColumnComplete = true;
  for (let i = 0; i < 5; i++) {
    let num = cardData['O'][i];
    if (!drawnNumbers.includes(num)) {
      rightColumnComplete = false;
      break;
    }
  }

  // Check bottom row (index 4)
  let bottomRowComplete = true;
  for (let letter of ['B', 'I', 'N', 'G', 'O']) {
    let num = cardData[letter][4];
    if (!drawnNumbers.includes(num)) {
      bottomRowComplete = false;
      break;
    }
  }

  // U-shape is complete if both vertical columns and bottom row are marked
  return leftColumnComplete && rightColumnComplete && bottomRowComplete;
}

function checkCornerShape(cardData, drawnNumbers) {
  // First row - check B and O
  if (!drawnNumbers.includes(cardData['B'][0]) ||
    !drawnNumbers.includes(cardData['O'][0])) {
    return false;
  }

  // Fifth row - check B and O
  if (!drawnNumbers.includes(cardData['B'][4]) ||
    !drawnNumbers.includes(cardData['O'][4])) {
    return false;
  }

  return true;
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
module.exports = { isWinner };