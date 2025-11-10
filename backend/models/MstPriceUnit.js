const { DataTypes } = require("sequelize");
const sequelize = require("./index");

const MstPriceUnit = sequelize.define(
  "mst_price_unit",
  {
    price_id: {
      type: DataTypes.STRING(16),
      primaryKey: true,
      allowNull: false,
    },
    unit_code: {
      //foreign key
      type: DataTypes.STRING(16),
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price_per_day: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("Active", "Inactive"),
      allowNull: false,
      defaultValue: "Active",
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    created_by: {
      type: DataTypes.STRING(16),
      allowNull: true,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    updated_by: {
      type: DataTypes.STRING(16),
      allowNull: true,
    },
  },
  {
    tableName: "mst_price_unit",
    timestamps: false,
  }
);

module.exports = MstPriceUnit;
