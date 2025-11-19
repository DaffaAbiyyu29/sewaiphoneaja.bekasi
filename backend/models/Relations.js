const MstUnit = require("./MstUnit");
const MstVariantUnit = require("./MstVariantUnit");
const MstPriceUnit = require("./MstPriceUnit");

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

module.exports = { MstUnit, MstVariantUnit, MstPriceUnit };
