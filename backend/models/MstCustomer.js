const { DataTypes } = require("sequelize");
const sequelize = require("./index");

const MstCustomer = sequelize.define(
  "mst_customer",
  {
    customer_id: {
      type: DataTypes.STRING(16),
      primaryKey: true,
      allowNull: false,
    },
    fullname: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    nik: {
      type: DataTypes.STRING(16),
      allowNull: false,
    },
    telp: {
      type: DataTypes.STRING(13),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    closest_contact_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    closest_contact_telp: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    social_media_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    social_media_username: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    ktp_image: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
    created_by: {
      type: DataTypes.STRING(16),
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true, // boleh null
    },
    updated_by: {
      type: DataTypes.STRING(16),
      allowNull: true, // boleh null
    },
    status: {
      type: DataTypes.ENUM("Active", "Inactive"),
      allowNull: true, // boleh null
      defaultValue: "Active",
    },
  },
  {
    tableName: "mst_customer",
    timestamps: false,
  }
);

module.exports = MstCustomer;
