export const getPage = (page) => {
  window.location.href = page;
};

export const openNewPage = (page) => {
  // '_blank' memberi tahu browser untuk membuka di tab baru
  window.open(page, "_blank");
};
