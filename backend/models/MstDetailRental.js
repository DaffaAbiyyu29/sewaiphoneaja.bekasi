const { DataTypes } = require("sequelize");
const sequelize = require("./index");

const TrnDetailRent = sequelize.define(
  "trn_detail_rent",
  {
    detail_id: {
      type: DataTypes.STRING(16),
      primaryKey: true,
      allowNull: false,
    },
    rent_id: {
      type: DataTypes.STRING(16),
      allowNull: true,
    },
    unit_code: {
      type: DataTypes.STRING(16),
      allowNull: true,
    },
    variant_unit_code: {
      type: DataTypes.STRING(16),
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    qty: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },
    subtotal: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
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
    tableName: "trn_detail_rent",
    timestamps: false,
  }
);

module.exports = TrnDetailRent;
