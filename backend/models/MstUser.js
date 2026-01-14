const { DataTypes } = require("sequelize");
const sequelize = require("./index");

const MstUser = sequelize.define(
  "mst_user",
  {
    user_id: {
      type: DataTypes.STRING(16),
      primaryKey: true,
      allowNull: false,
    },
    nik: {
      type: DataTypes.STRING(16),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("Admin", "Manager", "Supervisor"),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    telp: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    gender: {
      type: DataTypes.ENUM("M", "F"),
      allowNull: true,
    },
    birth_place: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    birth_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    profile_picture: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("Active", "Inactive"),
      defaultValue: "Active",
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.STRING(16),
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updated_by: {
      type: DataTypes.STRING(16),
      allowNull: true,
    },
    is_delete: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "mst_user",
    timestamps: false,
  }
);

module.exports = MstUser;
