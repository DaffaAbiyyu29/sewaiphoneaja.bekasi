const { DataTypes } = require("sequelize");
const sequelize = require("./index");

const TrnRent = sequelize.define(
  "trn_rent",
  {
    rent_id: {
      type: DataTypes.STRING(16),
      primaryKey: true,
      allowNull: false,
    },
    customer_id: {
      type: DataTypes.STRING(16),
      allowNull: true,
    },
    start_rent_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    end_rent_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    collect_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    return_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    total_price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    total_paid: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    balance: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    is_approval: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    approval_by: {
      type: DataTypes.STRING(16),
      allowNull: true,
    },
    approval_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("Open", "Close", "OverDue", "Invalid"),
      allowNull: true,
      defaultValue: "Open",
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
    tableName: "trn_rent",
    timestamps: false,
  }
);

module.exports = TrnRent;
