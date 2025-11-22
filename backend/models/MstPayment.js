const { DataTypes } = require("sequelize");
const sequelize = require("./index");

const TrnPayment = sequelize.define(
  "trn_payment",
  {
    payment_id: {
      type: DataTypes.STRING(16),
      primaryKey: true,
      allowNull: false,
    },
    rent_id: {
      type: DataTypes.STRING(16),
      allowNull: true,
    },
    payment_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    proof_of_payment: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    total_payment: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("Paid", "Unpaid"),
      allowNull: true,
      defaultValue: "Unpaid",
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
    tableName: "trn_payment",
    timestamps: false,
  }
);

module.exports = TrnPayment;
