export default class ApiClass {
    // query,
    // queryStr,
    constructor(query,queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    search() {
        const keyword = this.queryStr.keyword
        if (!keyword) return this;
        const safeKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        
        this.query = this.query.find({
            $or: [
                {name:{$regex:safeKeyword,$options:"i"}},
                {description:{$regex:safeKeyword,$options:"i"}},
                {tags:{$regex:safeKeyword,$options:"i"}},
                {category:{$regex:safeKeyword,$options:"i"}}
            ]
        })
        return this
    }
    filter() {
    const queryCopy = { ...this.queryStr };

    // 1. Remove non-document parameter keys so Mongo doesn't query unmapped fields
    const removeFields = ["page", "limit", "keyword", "activeSale", "minPrice", "maxPrice"];
    removeFields.forEach((field) => delete queryCopy[field]);

    // 2. Map minPrice / maxPrice to the actual document price field (discountPrice)
    if (this.queryStr.minPrice || this.queryStr.maxPrice) {
        queryCopy.discountPrice = queryCopy.discountPrice || {};
        if (this.queryStr.minPrice) queryCopy.discountPrice.gte = Number(this.queryStr.minPrice);
        if (this.queryStr.maxPrice) queryCopy.discountPrice.lte = Number(this.queryStr.maxPrice);
    }

    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (field) => `$${field}`);

    // 3. Convert any remaining stringified numbers (e.g. "100") into actual Numbers
    const parsedQuery = JSON.parse(queryStr, (key, value) => {
        if (typeof value === "string" && !isNaN(value) && value.trim() !== "") {
            return Number(value);
        }
        return value;
    });

    this.query = this.query.find(parsedQuery);
    return this;
}
    activeSale() {
    if (this.queryStr.activeSale === "true") {
        this.query = this.query.find({
            saleEndsAt: {
                $gt: new Date()
            }
        });
    }

    return this;
    }
   pagination(resultsPerPage) {
    const currentPage = Number(this.queryStr.page) || 1;

    const skip = resultsPerPage * (currentPage - 1);

    this.query = this.query
        .limit(resultsPerPage)
        .skip(skip);

    return this;
    }
    
}