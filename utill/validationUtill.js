/**
 * Gets a value from an object using the specified key
 * @param {Object} obj - The object to get the value from
 * @param {string} key - The key to look up
 * @returns {*} The value associated with the key, or undefined if not found
 */
const getValue = (obj, key) => {
  if (!obj || typeof obj !== 'object') {
    return undefined;
  }
  return obj[key];
};

/**
 * Validates if a value is included in an array of allowed values
 * @param {*} value - The value to validate
 * @param {Array} allowedValues - Array of allowed values
 * @returns {boolean} True if value is in allowedValues, false otherwise
 */
const valin = (value, allowedValues) => {
  if (!Array.isArray(allowedValues)) {
    return false;
  }
  return allowedValues.includes(value);
};

/**
 * Validates collateral type from an object
 * @param {Object} obj - The object containing collateral_type
 * @returns {boolean} True if collateral_type is valid, false otherwise
 */
const validateCollateralType = (obj) => {
  const allowedCollateralTypes = [
    "Commercial Building",
    "Residential Building", 
    "Condominium Residential",
    "Comdominium Commercial",
    "Apartement",
    "Mixed Use Building",
    "Warehouse Building",
    "Factory Building",
    "Coffee Site",
    "Farm"
  ];
  
  const collateralType = getValue(obj, "collateral_type");
  return valin(collateralType, allowedCollateralTypes);
};

module.exports = {
  getValue,
  valin,
  validateCollateralType
};