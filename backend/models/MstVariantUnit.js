const { DataTypes } = require("sequelize");
const sequelize = require("./index");

const MstVariantUnit = sequelize.define(
  "mst_variant_unit",
  {
    variant_unit_code: {
      type: DataTypes.STRING(16),
      primaryKey: true,
      allowNull: false,
    },
    unit_code: {
      //foreign key
      type: DataTypes.STRING(16),
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    qty: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("Available", "Rented", "Maintenance", "Inactive"),
      allowNull: false,
      defaultValue: "Available",
    },
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
    tableName: "mst_variant_unit",
    timestamps: false,
  }
);

module.exports = MstVariantUnit;
