export const searchPipeline = ({
  keyword = "",
  category,
  minPrice,
  maxPrice,
  page = 1,
  limit = 10,
}) => {
  const safeKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = { $regex: safeKeyword, $options: "i" };

  const productMatch = {
    approvalStatus: "approved",
    $or: [{ name: regex }, { category: regex }, { description: regex }, { tags: regex }],
  };

  if (category) productMatch.category = category;
  if (minPrice || maxPrice) {
    productMatch.discountPrice = {};
    if (minPrice) productMatch.discountPrice.$gte = Number(minPrice);
    if (maxPrice) productMatch.discountPrice.$lte = Number(maxPrice);
  }

  // Filters that only make sense on products push us into
  // products-only mode — stores don't have category/price, so
  // including them alongside a filtered product set is misleading.
  const onlyProducts = Boolean(category || minPrice || maxPrice);

  const skipNum = (page - 1) * limit;

  const productStage = [
    { $match: productMatch },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        images: 1,
        discountPrice: 1,
        originalPrice: 1,
        category: 1,
        createdAt: 1,
        itemType: { $literal: "product" },
      },
    },
  ];

  if (!onlyProducts) {
    const storeMatch = {
      approvalStatus: "approved",
      isActive: true,
      $or: [{ name: regex }, { description: regex }],
    };

    productStage.push({
      $unionWith: {
        coll: "stores",
        pipeline: [
          { $match: storeMatch },
          {
            $project: {
              _id: 1,
              name: 1,
              description: 1,
              banner: 1,
              ratings: 1,
              address: 1,
              createdAt: 1,
              itemType: { $literal: "store" },
            },
          },
        ],
      },
    });
  }

  return [
    ...productStage,
    { $sort: { createdAt: -1 } },
    { $skip: Number(skipNum) },
    { $limit: Number(limit) },
  ];
};