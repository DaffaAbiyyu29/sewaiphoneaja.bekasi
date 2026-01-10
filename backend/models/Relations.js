const MstUnit = require("./MstUnit");
const MstVariantUnit = require("./MstVariantUnit");
const MstPriceUnit = require("./MstPriceUnit");
const TrnDetailRent = require("./TrnDetailRental");
const TrnRent = require("./TrnRental");
const MstCustomer = require("./MstCustomer");

// ====== RELASI antar model ======

// satu unit bisa punya banyak variant
MstUnit.hasMany(MstVariantUnit, {
  foreignKey: "unit_code", // kolom FK di tabel variant
  as: "variants", // nama alias untuk include
});

// variant milik satu unit
MstVariantUnit.belongsTo(MstUnit, {
  foreignKey: "unit_code",
  as: "unit",
});

// satu unit bisa punya banyak harga
MstUnit.hasMany(MstPriceUnit, {
  foreignKey: "unit_code",
  as: "prices",
});

// price milik satu unit
MstPriceUnit.belongsTo(MstUnit, {
  foreignKey: "unit_code",
  as: "unit",
});

// detail rental milik satu unit
TrnDetailRent.belongsTo(MstUnit, {
  foreignKey: "unit_code",
  as: "unit",
});

// detail rental milik satu variant unit
TrnDetailRent.belongsTo(MstVariantUnit, {
  foreignKey: "variant_unit_code",
  as: "variant",
});

TrnRent.belongsTo(MstCustomer, {
  as: "customer",
  foreignKey: "customer_id",
});

TrnRent.hasMany(TrnDetailRent, {
  foreignKey: "rent_id",
  as: "details", // Kita beri alias 'details'
});

TrnDetailRent.belongsTo(TrnRent, {
  foreignKey: "rent_id",
  as: "rent",
});

MstCustomer.hasMany(TrnRent, {
  as: "rents",
  foreignKey: "customer_id",
});

module.exports = {
  MstUnit,
  MstVariantUnit,
  MstPriceUnit,
  TrnDetailRent,
  TrnRent,
  MstCustomer,
};
