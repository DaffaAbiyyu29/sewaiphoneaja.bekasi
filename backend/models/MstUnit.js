const { DataTypes } = require("sequelize");
const sequelize = require("./index");

const MstUnit = sequelize.define(
  "mst_unit",
  {
    unit_code: {
      type: DataTypes.STRING(16),
      primaryKey: true,
      allowNull: false,
    },
    unit_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    brand: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "Apple",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("Available", "Unavailable"),
      allowNull: false,
      defaultValue: "Available",
    },
    // price: {
    //   //hapus
    //   type: DataTypes.DECIMAL(12, 2),
    //   allowNull: false,
    // },
    photo: {
      type: DataTypes.STRING(255),
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
    tableName: "mst_unit",
    timestamps: false,
  }
);

module.exports = MstUnit;
