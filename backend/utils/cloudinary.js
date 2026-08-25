    import cloudinary from "../config/cloudinary.js"
    import streamifier from "streamifier"

    export const uploadToCloudinary = (buffer, folder, options) => {
        return new Promise(

            (resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder, resource_type: 'image', ...options },
                    (err, res) => {if (err) return reject(err);resolve(res);}
                )
                streamifier.createReadStream(buffer).pipe(stream);
            }
        )
        }

    export const deleteFromCloudinary = async(public_id)=>{
        if (!public_id) return;
        try {
            await cloudinary.uploader.destroy(public_id);
        } catch (error) {
            console.log(error);   
        }
    }