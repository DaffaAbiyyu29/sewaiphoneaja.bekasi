/**
 * @typedef {Object} PaginationMeta
 * @property {number} totalData
 * @property {number} currentPage
 * @property {number} totalPages
 * @property {number} pageSize
 */

/**
 * Kirim response API sukses
 *
 * @param {import("express").Response} res
 * @param {string} message
 * @param {any} [data=null]
 * @param {PaginationMeta} [pagination=null]
 * @param {number} [status=200]
 */
function resSuccess(res, message, data = null, pagination = null, status = 200) {
  const response = {
    success: true,
    message,
    data,
  };

  if (pagination) {
    response.totalData = pagination.totalData;
    response.currentPage = pagination.currentPage;
    response.totalPages = pagination.totalPages;
    response.pageSize = pagination.pageSize;
  }

  return res.status(status).json(response);
}

/**
 * Kirim response API error
 *
 * @param {import("express").Response} res
 * @param {string} message
 * @param {string|null} [error=null]
 * @param {number} [status=400]
 */
function resError(res, message, error = null, status = 400) {
  return res.status(status).json({
    success: false,
    message,
    error,
    data: null,
  });
}

module.exports = { resSuccess, resError };
