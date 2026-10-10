function getPagination(query, defaults = { page: 1, limit: 20, maxLimit: 100 }) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || defaults.page);
  const limit = Math.min(defaults.maxLimit, Math.max(1, Number.parseInt(query.limit, 10) || defaults.limit));
  return { page, limit, offset: (page - 1) * limit };
}

function paginationMeta(page, limit, total) {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

module.exports = { getPagination, paginationMeta };
