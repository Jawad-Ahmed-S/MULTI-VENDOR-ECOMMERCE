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
        const queryCopy = { ...this.queryStr }
        
        const removeFeilds = ["page", "limit", "keyword"]
        removeFeilds.forEach((feild) => delete queryCopy[feild])
        
        let queryStr = JSON.stringify(queryCopy);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g,(feild)=> `$${feild}`)
        
        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }
    pagination(resultsPerPage) {
        let currentPage = Number(this.query.page)
        const skip = resultsPerPage * (currentPage - 1)
        this.query = this.query.limit(resultsPerPage).skip(skip);
        return this
     }
    
}