import multer from "multer"

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true)
    else cb(new Error("Only image files are allowed"));
}

const storage = multer.memoryStorage();


export const uploadSingle = multer({
    storage,
    fileFilter,
    limits:{fileSize :5*1024*1024}
}).single("image")

export const uploadMultiple = multer({
    storage,
    fileFilter,
    limits:{fileSize :5*1024*1024}
}).array("images",10)
