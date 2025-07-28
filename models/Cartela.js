module.exports = (sequelize, DataTypes) => {
  const Cartela = sequelize.define("Cartela", {
    name: DataTypes.STRING,
    type: DataTypes.STRING, 
    company: DataTypes.STRING,
    grid: {
      type: DataTypes.JSON, // store the 5x5 array
      allowNull: false
    }
  });

  return Cartela;
};
