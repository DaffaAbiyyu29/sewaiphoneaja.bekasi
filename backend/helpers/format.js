const toUTC = (dateStr, endOfDay = false) => {
  const d = new Date(dateStr + "T00:00:00+07:00");
  if (endOfDay) d.setHours(23, 59, 59, 999);
  return new Date(d.toISOString());
};

module.exports = {
  toUTC,
};
