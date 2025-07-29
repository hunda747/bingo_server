const { Option } = require('./gameOption');
const logger = require('../logger');

function isWinner(cardData, drawnNumbers, gameType, cartelaType = 'classic') {
  logger.debug(`Checking winner for gameType: ${gameType}, cartelaType: ${cartelaType}`);
  
  // Normalize card data based on cartelaType
  const normalizedCard = normalizeCard(cardData, cartelaType);
  
  // Validate gameType
  const validGameTypes = [
    'Line1', 'Line2', 'Line3', 'tshape', 'xshape', 'hshape', 'ushape', 'star',
    'corner', 'butterfly', 'airplane', 'diamond', 'arrow', 'square', 'fullcorner',
    'heart', 'fullcard'
  ];
  if (!validGameTypes.includes(gameType)) {
    logger.warn(`Invalid gameType: ${gameType}, defaulting to Line1`);
    return checkLines(normalizedCard, drawnNumbers, 'Line1');
  }

  switch (gameType) {
    case 'Line1':
    case 'Line2':
    case 'Line3':
      return checkLines(normalizedCard, drawnNumbers, gameType);
    case 'tshape':
      return checkTShape(normalizedCard, drawnNumbers);
    case 'xshape':
      return checkXShape(normalizedCard, drawnNumbers);
    case 'hshape':
      return checkHShape(normalizedCard, drawnNumbers);
    case 'ushape':
      return checkUShape(normalizedCard, drawnNumbers);
    case 'star':
      return checkStarShape(normalizedCard, drawnNumbers);
    case 'corner':
      return checkCornerShape(normalizedCard, drawnNumbers);
    case 'butterfly':
      return checkButterflyShape(normalizedCard, drawnNumbers);
    case 'airplane':
      return checkAirplaneShape(normalizedCard, drawnNumbers);
    case 'diamond':
      return checkDiamondShape(normalizedCard, drawnNumbers);
    case 'arrow':
      return checkArrowShape(normalizedCard, drawnNumbers);
    case 'square':
      return checkSquareAroundFreeSpace(normalizedCard, drawnNumbers);
    case 'fullcorner':
      return checkFullCorner(normalizedCard, drawnNumbers);
    case 'heart':
      return checkHeartShape(normalizedCard, drawnNumbers);
    case 'fullcard':
      return checkFullCard(normalizedCard, drawnNumbers);
    default:
      logger.error(`Unhandled gameType: ${gameType}`);
      return false;
  }
}

function normalizeCard(cardData, cartelaType) {
  if (cartelaType === 'classic') {
    return cardData; // { B: [], I: [], N: [], G: [], O: [] }
  }
  // Africa cartela: Assume array of 15 numbers
  if (cartelaType === 'africa') {
    logger.warn('Africa cartela normalization is placeholder. Verify card structure.');
    if (!Array.isArray(cardData) || cardData.length !== 15) {
      logger.error('Invalid Africa cartela structure');
      throw new Error('Invalid Africa cartela structure');
    }
    // Convert to classic format (placeholder mapping)
    return {
      B: cardData.slice(0, 3).concat([null, null]), // Pad with nulls
      I: cardData.slice(3, 6).concat([null, null]),
      N: [cardData[6], cardData[7], null, cardData[8], cardData[9]], // Free space at N[2]
      G: cardData.slice(10, 13).concat([null, null]),
      O: cardData.slice(13, 15).concat([null, null, null])
    };
  }
  logger.error(`Unknown cartelaType: ${cartelaType}`);
  throw new Error(`Unknown cartelaType: ${cartelaType}`);
}

function checkLines(cardData, drawnNumbers, gameType) {
  const line = Option[gameType] || 1;
  logger.debug(`Checking lines for ${gameType}, required: ${line}`);
  const {
    horizontalCount,
    verticalCount,
    mainDiagonalCount,
    secondaryDiagonalCount
  } = getWinningRows(cardData, drawnNumbers, line);

  const total = horizontalCount + verticalCount + mainDiagonalCount + secondaryDiagonalCount;
  logger.debug(`Line counts: H=${horizontalCount}, V=${verticalCount}, MD=${mainDiagonalCount}, SD=${secondaryDiagonalCount}, Total=${total}`);
  return total >= line;
}

function checkTShape(cardData, drawnNumbers) {
  let topRowComplete = true;
  for (let letter of ['B', 'I', 'N', 'G', 'O']) {
    let num = cardData[letter][0];
    if (num !== null && !drawnNumbers.includes(num)) {
      topRowComplete = false;
      break;
    }
  }

  let middleColumnComplete = true;
  for (let i = 1; i < 5; i++) {
    let num = cardData['N'][i];
    if (num !== null && !drawnNumbers.includes(num)) {
      middleColumnComplete = false;
      break;
    }
  }

  logger.debug(`T-shape: TopRow=${topRowComplete}, MiddleColumn=${middleColumnComplete}`);
  return topRowComplete && middleColumnComplete;
}

function checkXShape(cardData, drawnNumbers) {
  const letters = ['B', 'I', 'N', 'G', 'O'];
  let mainDiagonalComplete = true;
  for (let i = 0; i < 5; i++) {
    let num = cardData[letters[i]][i];
    if (num !== null && !drawnNumbers.includes(num)) {
      mainDiagonalComplete = false;
      break;
    }
  }

  let secondaryDiagonalComplete = true;
  for (let i = 0; i < 5; i++) {
    let num = cardData[letters[i]][4 - i];
    if (num !== null && !drawnNumbers.includes(num)) {
      secondaryDiagonalComplete = false;
      break;
    }
  }

  logger.debug(`X-shape: MainDiagonal=${mainDiagonalComplete}, SecondaryDiagonal=${secondaryDiagonalComplete}`);
  return mainDiagonalComplete && secondaryDiagonalComplete;
}

function checkHShape(cardData, drawnNumbers) {
  let leftColumnComplete = true;
  for (let i = 0; i < 5; i++) {
    let num = cardData['B'][i];
    if (num !== null && !drawnNumbers.includes(num)) {
      leftColumnComplete = false;
      break;
    }
  }

  let rightColumnComplete = true;
  for (let i = 0; i < 5; i++) {
    let num = cardData['O'][i];
    if (num !== null && !drawnNumbers.includes(num)) {
      rightColumnComplete = false;
      break;
    }
  }

  let middleRowComplete = true;
  for (let letter of ['B', 'I', 'N', 'G', 'O']) {
    let num = cardData[letter][2];
    if (num !== null && !drawnNumbers.includes(num)) {
      middleRowComplete = false;
      break;
    }
  }

  logger.debug(`H-shape: LeftColumn=${leftColumnComplete}, RightColumn=${rightColumnComplete}, MiddleRow=${middleRowComplete}`);
  return leftColumnComplete && rightColumnComplete && middleRowComplete;
}

function checkStarShape(cardData, drawnNumbers) {
  if (cardData['N'][0] !== null && !drawnNumbers.includes(cardData['N'][0])) {
    return false;
  }
  for (let letter of ['B', 'I', 'N', 'G', 'O']) {
    if (cardData[letter][1] !== null && !drawnNumbers.includes(cardData[letter][1])) {
      return false;
    }
  }
  if (cardData['N'][2] !== null && !drawnNumbers.includes(cardData['N'][2])) {
    return false;
  }
  if (cardData['I'][3] !== null && !drawnNumbers.includes(cardData['I'][3]) ||
      cardData['G'][3] !== null && !drawnNumbers.includes(cardData['G'][3])) {
    return false;
  }
  if (cardData['B'][4] !== null && !drawnNumbers.includes(cardData['B'][4]) ||
      cardData['O'][4] !== null && !drawnNumbers.includes(cardData['O'][4])) {
    return false;
  }

  logger.debug('Star-shape: All required positions marked');
  return true;
}

function checkUShape(cardData, drawnNumbers) {
  let leftColumnComplete = true;
  for (let i = 0; i < 5; i++) {
    let num = cardData['B'][i];
    if (num !== null && !drawnNumbers.includes(num)) {
      leftColumnComplete = false;
      break;
    }
  }

  let rightColumnComplete = true;
  for (let i = 0; i < 5; i++) {
    let num = cardData['O'][i];
    if (num !== null && !drawnNumbers.includes(num)) {
      rightColumnComplete = false;
      break;
    }
  }

  let bottomRowComplete = true;
  for (let letter of ['B', 'I', 'N', 'G', 'O']) {
    let num = cardData[letter][4];
    if (num !== null && !drawnNumbers.includes(num)) {
      bottomRowComplete = false;
      break;
    }
  }

  logger.debug(`U-shape: LeftColumn=${leftColumnComplete}, RightColumn=${rightColumnComplete}, BottomRow=${bottomRowComplete}`);
  return leftColumnComplete && rightColumnComplete && bottomRowComplete;
}

function checkCornerShape(cardData, drawnNumbers) {
  if (cardData['B'][0] !== null && !drawnNumbers.includes(cardData['B'][0]) ||
      cardData['O'][0] !== null && !drawnNumbers.includes(cardData['O'][0]) ||
      cardData['B'][4] !== null && !drawnNumbers.includes(cardData['B'][4]) ||
      cardData['O'][4] !== null && !drawnNumbers.includes(cardData['O'][4])) {
    return false;
  }

  logger.debug('Corner-shape: All corners marked');
  return true;
}

function checkButterflyShape(cardData, drawnNumbers) {
  if (cardData['B'][0] !== null && !drawnNumbers.includes(cardData['B'][0]) ||
      cardData['B'][4] !== null && !drawnNumbers.includes(cardData['B'][4]) ||
      cardData['O'][0] !== null && !drawnNumbers.includes(cardData['O'][0]) ||
      cardData['O'][4] !== null && !drawnNumbers.includes(cardData['O'][4])) {
    return false;
  }

  for (let letter of ['I', 'N', 'G']) {
    for (let i = 1; i < 4; i++) {
      let num = cardData[letter][i];
      if (num !== null && !drawnNumbers.includes(num)) {
        return false;
      }
    }
  }

  logger.debug('Butterfly-shape: All required positions marked');
  return true;
}

function checkAirplaneShape(cardData, drawnNumbers) {
  if (cardData['B'][3] !== null && !drawnNumbers.includes(cardData['B'][3]) ||
      cardData['O'][3] !== null && !drawnNumbers.includes(cardData['O'][3]) ||
      cardData['I'][0] !== null && !drawnNumbers.includes(cardData['I'][0]) ||
      cardData['I'][3] !== null && !drawnNumbers.includes(cardData['I'][3]) ||
      cardData['G'][0] !== null && !drawnNumbers.includes(cardData['G'][0]) ||
      cardData['G'][3] !== null && !drawnNumbers.includes(cardData['G'][3])) {
    return false;
  }

  for (let i = 0; i < 5; i++) {
    let num = cardData['N'][i];
    if (num !== null && !drawnNumbers.includes(num)) {
      return false;
    }
  }

  logger.debug('Airplane-shape: All required positions marked');
  return true;
}

function checkDiamondShape(cardData, drawnNumbers) {
  if (cardData['B'][2] !== null && !drawnNumbers.includes(cardData['B'][2]) ||
      cardData['O'][2] !== null && !drawnNumbers.includes(cardData['O'][2])) {
    return false;
  }

  for (let letter of ['I', 'G']) {
    for (let i = 1; i <= 3; i++) {
      let num = cardData[letter][i];
      if (num !== null && !drawnNumbers.includes(num)) {
        return false;
      }
    }
  }

  for (let i = 0; i < 5; i++) {
    let num = cardData['N'][i];
    if (num !== null && !drawnNumbers.includes(num)) {
      return false;
    }
  }

  logger.debug('Diamond-shape: All required positions marked');
  return true;
}

function checkArrowShape(cardData, drawnNumbers) {
  if (cardData['B'][2] !== null && !drawnNumbers.includes(cardData['B'][2]) ||
      cardData['O'][2] !== null && !drawnNumbers.includes(cardData['O'][2]) ||
      cardData['I'][1] !== null && !drawnNumbers.includes(cardData['I'][1]) ||
      cardData['G'][1] !== null && !drawnNumbers.includes(cardData['G'][1])) {
    return false;
  }

  for (let i = 0; i < 5; i++) {
    let num = cardData['N'][i];
    if (num !== null && !drawnNumbers.includes(num)) {
      return false;
    }
  }

  logger.debug('Arrow-shape: All required positions marked');
  return true;
}

function checkSquareAroundFreeSpace(cardData, drawnNumbers) {
  if (cardData['N'][1] !== null && !drawnNumbers.includes(cardData['N'][1]) ||
      cardData['N'][3] !== null && !drawnNumbers.includes(cardData['N'][3]) ||
      cardData['I'][2] !== null && !drawnNumbers.includes(cardData['I'][2]) ||
      cardData['G'][2] !== null && !drawnNumbers.includes(cardData['G'][2])) {
    return false;
  }

  logger.debug('Square-shape: All positions around free space marked');
  return true;
}

function checkFullCorner(cardData, drawnNumbers) {
  if (cardData['B'][0] !== null && !drawnNumbers.includes(cardData['B'][0]) ||
      cardData['O'][0] !== null && !drawnNumbers.includes(cardData['O'][0]) ||
      cardData['B'][4] !== null && !drawnNumbers.includes(cardData['B'][4]) ||
      cardData['O'][4] !== null && !drawnNumbers.includes(cardData['O'][4])) {
    return false;
  }

  logger.debug('FullCorner-shape: All corners marked');
  return true;
}

function checkFullCard(cardData, drawnNumbers) {
  for (const column in cardData) {
    for (let row = 0; row < cardData[column].length; row++) {
      if (column === 'N' && row === 2 && cardData[column][row] === null) continue;
      const number = cardData[column][row];
      if (number !== null && !drawnNumbers.includes(number)) {
        return false;
      }
    }
  }

  logger.debug('FullCard: All positions marked');
  return true;
}

function checkHeartShape(cardData, drawnNumbers) {
  for (let letter of ['B', 'O']) {
    for (let i = 0; i <= 2; i++) {
      if (cardData[letter][i] !== null && !drawnNumbers.includes(cardData[letter][i])) {
        return false;
      }
    }
  }

  for (let letter of ['I', 'G']) {
    if (cardData[letter][0] !== null && !drawnNumbers.includes(cardData[letter][0]) ||
        cardData[letter][3] !== null && !drawnNumbers.includes(cardData[letter][3])) {
      return false;
    }
  }

  for (let i of [1, 2, 4]) {
    let num = cardData['N'][i];
    if (num !== null && !drawnNumbers.includes(num)) {
      return false;
    }
  }

  logger.debug('Heart-shape: All required positions marked');
  return true;
}

function getWinningRows(cardData, drawnNumbers, line) {
  let horizontalCount = 0;
  let verticalCount = 0;
  let mainDiagonalCount = 0;
  let secondaryDiagonalCount = 0;

  // Check horizontal lines
  for (let rowIndex = 0; rowIndex < 5; rowIndex++) {
    let markedCount = 0;
    for (let letter of ['B', 'I', 'N', 'G', 'O']) {
      let num = cardData[letter][rowIndex];
      if (num === null || drawnNumbers.includes(num)) {
        markedCount++;
      }
    }
    if (markedCount === 5) {
      horizontalCount++;
      if (horizontalCount >= line) {
        return { horizontalCount, verticalCount, mainDiagonalCount, secondaryDiagonalCount };
      }
    }
  }

  // Check vertical lines
  for (let col = 0; col < 5; col++) {
    let markedCount = 0;
    for (let letter of ['B', 'I', 'N', 'G', 'O']) {
      let num = cardData[letter][col];
      if (num === null || drawnNumbers.includes(num)) {
        markedCount++;
      }
    }
    if (markedCount === 5) {
      verticalCount++;
      if (verticalCount >= line) {
        return { horizontalCount, verticalCount, mainDiagonalCount, secondaryDiagonalCount };
      }
    }
  }

  // Check main diagonal (top-left to bottom-right)
  let mainDiagonalMarked = 0;
  for (let i = 0; i < 5; i++) {
    let num = cardData[['B', 'I', 'N', 'G', 'O'][i]][i];
    if (num === null || drawnNumbers.includes(num)) {
      mainDiagonalMarked++;
    }
  }
  if (mainDiagonalMarked === 5) {
    mainDiagonalCount++;
    if (mainDiagonalCount >= line) {
      return { horizontalCount, verticalCount, mainDiagonalCount, secondaryDiagonalCount };
    }
  }

  // Check secondary diagonal (top-right to bottom-left)
  let secondaryDiagonalMarked = 0;
  for (let i = 0; i < 5; i++) {
    let num = cardData[['B', 'I', 'N', 'G', 'O'][i]][4 - i];
    if (num === null || drawnNumbers.includes(num)) {
      secondaryDiagonalMarked++;
    }
  }
  if (secondaryDiagonalMarked === 5) {
    secondaryDiagonalCount++;
    if (secondaryDiagonalCount >= line) {
      return { horizontalCount, verticalCount, mainDiagonalCount, secondaryDiagonalCount };
    }
  }

  return { horizontalCount, verticalCount, mainDiagonalCount, secondaryDiagonalCount };
}

module.exports = { isWinner };



// const { Option } = require('./gameOption');

// function isWinner(cardData, drawnNumbers, gameType) {
//   // console.log("card", cardData);
//   // console.log("drawNumbers", drawnNumbers);
//   // console.log("option", gameType);
//   const pattern = 'corner';
//   console.log('gameType', gameType);
//   // Check which pattern to validate
//   switch (gameType) {
//     case 'Line1' || 'Line2' || 'Line3':
//       return checkLines(cardData, drawnNumbers, gameType);
//     case 'tshape':
//       return checkTShape(cardData, drawnNumbers);
//     case 'xshape':
//       return checkXShape(cardData, drawnNumbers);
//     case 'hshape':
//       return checkHShape(cardData, drawnNumbers);
//     case 'ushape':
//       return checkUShape(cardData, drawnNumbers);
//     case 'star':
//       return checkStarShape(cardData, drawnNumbers);
//     case 'corner':
//       return checkCornerShape(cardData, drawnNumbers);
//     case 'butterfly':
//       return checkButterflyShape(cardData, drawnNumbers);
//     case 'airplane':
//       return checkAirplaneShape(cardData, drawnNumbers);
//     case 'diamond':
//       return checkDiamondShape(cardData, drawnNumbers);
//     case 'arrow':
//       return checkArrowShape(cardData, drawnNumbers);
//     case 'square':
//       return checkSquareAroundFreeSpace(cardData, drawnNumbers);
//     case 'fullcorner':
//       return checkFullCorner(cardData, drawnNumbers);
//     case 'heart':
//       return checkHeartShape(cardData, drawnNumbers);
//     case 'fullcard':
//       return checkFullCard(cardData, drawnNumbers);
//     default:
//       return checkLines(cardData, drawnNumbers, gameType);
//   }
// }

// function checkLines(cardData, drawnNumbers, gameType) {
//   const line = Option[gameType];
//   const {
//     horizontalCount,
//     verticalCount,
//     mainDiagonalCount,
//     secondaryDiagonalCount,
//   } = getWinningRows(cardData, drawnNumbers, line);

//   // Check for combinations
//   if (
//     parseInt(
//       horizontalCount +
//         verticalCount +
//         mainDiagonalCount +
//         secondaryDiagonalCount
//     ) >= line
//   ) {
//     return true;
//   }
//   return false;
// }

// function checkTShape(cardData, drawnNumbers) {
//   // Check top row (first number from each column)
//   let topRowComplete = true;
//   for (let letter of ['B', 'I', 'N', 'G', 'O']) {
//     let num = cardData[letter][0];
//     if (!drawnNumbers.includes(num)) {
//       topRowComplete = false;
//       break;
//     }
//   }

//   // Check middle vertical column (N column)
//   let middleColumnComplete = true;
//   for (let i = 1; i < 5; i++) {
//     let num = cardData['N'][i];
//     // Account for free space in the middle
//     if (!drawnNumbers.includes(num) && !(i === 2 && num === null)) {
//       middleColumnComplete = false;
//       break;
//     }
//   }

//   // T-shape is complete if both top row and middle column are marked
//   return topRowComplete && middleColumnComplete;
// }

// function checkXShape(cardData, drawnNumbers) {
//   const letters = ['B', 'I', 'N', 'G', 'O'];

//   // Check main diagonal (top-left to bottom-right)
//   let mainDiagonalComplete = true;
//   for (let i = 0; i < 5; i++) {
//     let num = cardData[letters[i]][i];
//     // Account for free space in the middle
//     if (!drawnNumbers.includes(num) && !(i === 2 && num === null)) {
//       mainDiagonalComplete = false;
//       break;
//     }
//   }

//   // Check secondary diagonal (top-right to bottom-left)
//   let secondaryDiagonalComplete = true;
//   for (let i = 0; i < 5; i++) {
//     let num = cardData[letters[i]][4 - i];
//     // Account for free space in the middle
//     if (!drawnNumbers.includes(num) && !(i === 2 && num === null)) {
//       secondaryDiagonalComplete = false;
//       break;
//     }
//   }

//   // X-shape is complete if both diagonals are marked
//   return mainDiagonalComplete && secondaryDiagonalComplete;
// }

// function checkHShape(cardData, drawnNumbers) {
//   // Check left vertical column (B column)
//   let leftColumnComplete = true;
//   for (let i = 0; i < 5; i++) {
//     let num = cardData['B'][i];
//     if (!drawnNumbers.includes(num)) {
//       leftColumnComplete = false;
//       break;
//     }
//   }

//   // Check right vertical column (O column)
//   let rightColumnComplete = true;
//   for (let i = 0; i < 5; i++) {
//     let num = cardData['O'][i];
//     if (!drawnNumbers.includes(num)) {
//       rightColumnComplete = false;
//       break;
//     }
//   }

//   // Check middle row (row 2, which contains the free space)
//   let middleRowComplete = true;
//   for (let letter of ['B', 'I', 'N', 'G', 'O']) {
//     let num = cardData[letter][2];
//     // Account for free space in the middle
//     if (!drawnNumbers.includes(num) && !(letter === 'N' && num === null)) {
//       middleRowComplete = false;
//       break;
//     }
//   }

//   // H-shape is complete if both vertical columns and middle row are marked
//   return leftColumnComplete && rightColumnComplete && middleRowComplete;
// }

// function checkStarShape(cardData, drawnNumbers) {
//   // First row - check N only
//   if (!drawnNumbers.includes(cardData['N'][0])) {
//     return false;
//   }

//   // Second row - check all positions
//   for (let letter of ['B', 'I', 'N', 'G', 'O']) {
//     if (!drawnNumbers.includes(cardData[letter][1])) {
//       return false;
//     }
//   }

//   // Third row - check N only
//   if (!drawnNumbers.includes(cardData['N'][2]) && cardData['N'][2] !== null) {
//     return false;
//   }

//   // Fourth row - check I and G only
//   if (
//     !drawnNumbers.includes(cardData['I'][3]) ||
//     !drawnNumbers.includes(cardData['G'][3])
//   ) {
//     return false;
//   }

//   // Fifth row - check B and O only
//   if (
//     !drawnNumbers.includes(cardData['B'][4]) ||
//     !drawnNumbers.includes(cardData['O'][4])
//   ) {
//     return false;
//   }

//   return true;
// }

// function checkUShape(cardData, drawnNumbers) {
//   // Check left vertical column (B column)
//   let leftColumnComplete = true;
//   for (let i = 0; i < 5; i++) {
//     let num = cardData['B'][i];
//     if (!drawnNumbers.includes(num)) {
//       leftColumnComplete = false;
//       break;
//     }
//   }

//   // Check right vertical column (O column)
//   let rightColumnComplete = true;
//   for (let i = 0; i < 5; i++) {
//     let num = cardData['O'][i];
//     if (!drawnNumbers.includes(num)) {
//       rightColumnComplete = false;
//       break;
//     }
//   }

//   // Check bottom row (index 4)
//   let bottomRowComplete = true;
//   for (let letter of ['B', 'I', 'N', 'G', 'O']) {
//     let num = cardData[letter][4];
//     if (!drawnNumbers.includes(num)) {
//       bottomRowComplete = false;
//       break;
//     }
//   }

//   // U-shape is complete if both vertical columns and bottom row are marked
//   return leftColumnComplete && rightColumnComplete && bottomRowComplete;
// }

// function checkCornerShape(cardData, drawnNumbers) {
//   // First row - check B and O
//   if (
//     !drawnNumbers.includes(cardData['B'][0]) ||
//     !drawnNumbers.includes(cardData['O'][0])
//   ) {
//     return false;
//   }

//   // Fifth row - check B and O
//   if (
//     !drawnNumbers.includes(cardData['B'][4]) ||
//     !drawnNumbers.includes(cardData['O'][4])
//   ) {
//     return false;
//   }

//   return true;
// }

// function checkButterflyShape(cardData, drawnNumbers) {
//   // Check B and O columns (only first and last positions)
//   if (
//     !drawnNumbers.includes(cardData['B'][0]) ||
//     !drawnNumbers.includes(cardData['B'][4]) ||
//     !drawnNumbers.includes(cardData['O'][0]) ||
//     !drawnNumbers.includes(cardData['O'][4])
//   ) {
//     return false;
//   }

//   // Check I, N, G columns (all positions except first and last)
//   for (let letter of ['I', 'N', 'G']) {
//     for (let i = 1; i < 4; i++) {
//       let num = cardData[letter][i];
//       // Account for free space in the middle
//       if (
//         !drawnNumbers.includes(num) &&
//         !(letter === 'N' && i === 2 && num === null)
//       ) {
//         return false;
//       }
//     }
//   }

//   return true;
// }

// function checkAirplaneShape(cardData, drawnNumbers) {
//   // Check B and O columns (only 4th row - index 3)
//   if (
//     !drawnNumbers.includes(cardData['B'][3]) ||
//     !drawnNumbers.includes(cardData['O'][3])
//   ) {
//     return false;
//   }

//   // Check I and G columns (only 1st and 4th rows - indices 0 and 3)
//   if (
//     !drawnNumbers.includes(cardData['I'][0]) ||
//     !drawnNumbers.includes(cardData['I'][3]) ||
//     !drawnNumbers.includes(cardData['G'][0]) ||
//     !drawnNumbers.includes(cardData['G'][3])
//   ) {
//     return false;
//   }

//   // Check N column (all positions)
//   for (let i = 0; i < 5; i++) {
//     let num = cardData['N'][i];
//     // Account for free space in the middle
//     if (!drawnNumbers.includes(num) && !(i === 2 && num === null)) {
//       return false;
//     }
//   }

//   return true;
// }

// function checkDiamondShape(cardData, drawnNumbers) {
//   // Check B and O columns (only 3rd row - index 2)
//   if (
//     !drawnNumbers.includes(cardData['B'][2]) ||
//     !drawnNumbers.includes(cardData['O'][2])
//   ) {
//     return false;
//   }

//   // Check I and G columns (2nd, 3rd, and 4th rows - indices 1, 2, and 3)
//   for (let letter of ['I', 'G']) {
//     for (let i = 1; i <= 3; i++) {
//       let num = cardData[letter][i];
//       if (!drawnNumbers.includes(num)) {
//         return false;
//       }
//     }
//   }

//   // Check N column (all positions)
//   for (let i = 0; i < 5; i++) {
//     let num = cardData['N'][i];
//     // Account for free space in the middle
//     if (!drawnNumbers.includes(num) && !(i === 2 && num === null)) {
//       return false;
//     }
//   }

//   return true;
// }

// function checkArrowShape(cardData, drawnNumbers) {
//   // Check B and O columns (only 3rd row - index 2)
//   if (
//     !drawnNumbers.includes(cardData['B'][2]) ||
//     !drawnNumbers.includes(cardData['O'][2])
//   ) {
//     return false;
//   }

//   // Check I and G columns (only 2nd row - index 1)
//   if (
//     !drawnNumbers.includes(cardData['I'][1]) ||
//     !drawnNumbers.includes(cardData['G'][1])
//   ) {
//     return false;
//   }

//   // Check N column (all positions)
//   for (let i = 0; i < 5; i++) {
//     let num = cardData['N'][i];
//     // Account for free space in the middle
//     if (!drawnNumbers.includes(num) && !(i === 2 && num === null)) {
//       return false;
//     }
//   }

//   return true;
// }

// function checkSquareAroundFreeSpace(cardData, drawnNumbers) {
//   // The free space is at cardData['N'][2] which is usually null
//   //  four adjacent positions around it:
//   // top: N[1]
//   // bottom: N[3]
//   // left: I[2]
//   // right: G[2]

//   // Check top
//   if (!drawnNumbers.includes(cardData['N'][1])) {
//     return false;
//   }

//   // Check bottom
//   if (!drawnNumbers.includes(cardData['N'][3])) {
//     return false;
//   }

//   // Check left
//   if (!drawnNumbers.includes(cardData['I'][2])) {
//     return false;
//   }

//   // Check right
//   if (!drawnNumbers.includes(cardData['G'][2])) {
//     return false;
//   }

//   // All four squares around free space are marked
//   return true;
// }



// function checkFullCorner(cardData, drawnNumbers) {
//   // Four corners are:
//   // Top-left:    cardData['B'][0]
//   // Top-right:   cardData['O'][0]
//   // Bottom-left: cardData['B'][4]
//   // Bottom-right:cardData['O'][4]

//   const topLeft = cardData['B'][0];
//   const topRight = cardData['O'][0];
//   const bottomLeft = cardData['B'][4];
//   const bottomRight = cardData['O'][4];

//   // Check each corner
//   if (!drawnNumbers.includes(topLeft)) return false;
//   if (!drawnNumbers.includes(topRight)) return false;
//   if (!drawnNumbers.includes(bottomLeft)) return false;
//   if (!drawnNumbers.includes(bottomRight)) return false;

//   // All four corners are marked
//   return true;
// }

// function checkFullCard(cardData, drawnNumbers) {
//   for (const column in cardData) {
//     for (let row = 0; row < cardData[column].length; row++) {
//       // Skip the center FREE space (usually N[2])
//       if (column === 'N' && row === 2) continue;

//       const number = cardData[column][row];
//       if (!drawnNumbers.includes(number)) {
//         return false; // Found a number that hasn't been drawn
//       }
//     }
//   }
//   return true; // All numbers (except free space) are marked
// }





// function checkHeartShape(cardData, drawnNumbers) {
//   // Check B and O columns (1st, 2nd, and 3rd rows - indices 0, 1, 2)
//   for (let letter of ['B', 'O']) {
//     for (let i = 0; i <= 2; i++) {
//       if (!drawnNumbers.includes(cardData[letter][i])) {
//         return false;
//       }
//     }
//   }
// }

// function checkHeartShape(cardData, drawnNumbers) {
//   // Check B and O columns (1st, 2nd, and 3rd rows - indices 0, 1, 2)
//   for (let letter of ['B', 'O']) {
//     for (let i = 0; i <= 2; i++) {
//       if (!drawnNumbers.includes(cardData[letter][i])) {
//         return false;
//       }
//     }
//   }

//   // Check I and G columns (1st and 4th rows - indices 0, 3)
//   for (let letter of ['I', 'G']) {
//     if (
//       !drawnNumbers.includes(cardData[letter][0]) ||
//       !drawnNumbers.includes(cardData[letter][3])
//     ) {
//       return false;
//     }
//   }

//   // Check N column (2nd, 3rd, and 5th rows - indices 1, 2, 4)
//   const nIndices = [1, 2, 4];
//   for (let i of nIndices) {
//     let num = cardData['N'][i];
//     // Account for free space in the middle
//     if (!drawnNumbers.includes(num) && !(i === 2 && num === null)) {
//       return false;
//     }
//   }

//   return true;
// }

// const getWinningRows = (cardData, drawnNumbers, line) => {
//   console.log('line', line);
//   let horizontalCount = 0;
//   let verticalCount = 0;
//   let mainDiagonalCount = 0;
//   let secondaryDiagonalCount = 0;
//   // console.log('drawn number', drawnNumbers.sort((a, b) => a - b));

//   // Check horizontal lines
//   for (let row of Object.values(cardData)) {
//     let markedCount = 0;
//     for (let num of row) {
//       if (
//         drawnNumbers.includes(num) ||
//         (num === null &&
//           row[2] === null &&
//           drawnNumbers.includes(row[0]) &&
//           drawnNumbers.includes(row[4]))
//       ) {
//         markedCount++;
//       }
//     }
//     if (markedCount === 5) {
//       horizontalCount++;
//       if (horizontalCount >= line) {
//         return {
//           horizontalCount,
//           verticalCount,
//           mainDiagonalCount,
//           secondaryDiagonalCount,
//         };
//       }
//     }
//   }

//   // Check vertical lines
//   for (let col = 0; col < 5; col++) {
//     let markedCount = 0;
//     for (let letter of Object.keys(cardData)) {
//       let num = cardData[letter][col];
//       if (
//         drawnNumbers.includes(num) ||
//         (col === 2 &&
//           num === null &&
//           cardData['N'][2] === null &&
//           drawnNumbers.includes(cardData['B'][2]) &&
//           drawnNumbers.includes(cardData['O'][2]))
//       ) {
//         markedCount++;
//       }
//     }
//     if (markedCount === 5) {
//       verticalCount++;
//       if (verticalCount >= line) {
//         return {
//           horizontalCount,
//           verticalCount,
//           mainDiagonalCount,
//           secondaryDiagonalCount,
//         };
//       }
//     }
//   }

//   // Check main diagonal (top-left to bottom-right)
//   if (
//     drawnNumbers.includes(cardData['B'][0]) &&
//     drawnNumbers.includes(cardData['I'][1]) &&
//     //   drawnNumbers.includes(cardData['N'][2]) &&
//     drawnNumbers.includes(cardData['G'][3]) &&
//     drawnNumbers.includes(cardData['O'][4])
//   ) {
//     mainDiagonalCount++;
//     if (mainDiagonalCount >= line) {
//       return {
//         horizontalCount,
//         verticalCount,
//         mainDiagonalCount,
//         secondaryDiagonalCount,
//       };
//     }
//   }

//   // Check secondary diagonal (top-right to bottom-left)
//   if (
//     drawnNumbers.includes(cardData['B'][4]) &&
//     drawnNumbers.includes(cardData['I'][3]) &&
//     drawnNumbers.includes(cardData['G'][1]) &&
//     drawnNumbers.includes(cardData['O'][0])
//   ) {
//     secondaryDiagonalCount++;
//     if (secondaryDiagonalCount >= line) {
//       return {
//         horizontalCount,
//         verticalCount,
//         mainDiagonalCount,
//         secondaryDiagonalCount,
//       };
//     }
//   }
//   console.log('hor', horizontalCount);
//   console.log('ver', verticalCount);
//   console.log('dia: ', mainDiagonalCount, ' : ', secondaryDiagonalCount);

//   console.log(
//     'sum',
//     horizontalCount + verticalCount + mainDiagonalCount + secondaryDiagonalCount
//   );

//   return {
//     horizontalCount,
//     verticalCount,
//     mainDiagonalCount,
//     secondaryDiagonalCount,
//   };
// };

// // console.log(isWinner(cardData, drawnNumbers)); // Output: true (this card is a winner with 1 horizontal and 1 vertical line)
// module.exports = { isWinner };
