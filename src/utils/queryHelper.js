export const buildQuery = (reqQuery, searchableFields = []) => {
  const queryObj = { ...reqQuery };

  // Remove special params
  const excludeFields = ["search", "sort", "page", "limit"];
  excludeFields.forEach((param) => delete queryObj[param]);

  // Advanced filter (gte, lte, etc.)
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);

  let filter = JSON.parse(queryStr);

  // Search by keyword (applies OR logic across provided fields)
  if (reqQuery.search && searchableFields.length > 0) {
    const searchRegex = new RegExp(reqQuery.search, "i");
    filter.$or = searchableFields.map((field) => ({ [field]: searchRegex }));
  }

  // Sorting
  const sort = reqQuery.sort ? reqQuery.sort.split(",").join(" ") : "-createdAt";

  // Pagination
  const page = parseInt(reqQuery.page, 10) || 1;
  const limit = parseInt(reqQuery.limit, 10) || 10;
  const skip = (page - 1) * limit;

  return { filter, sort, page, limit, skip };
};
