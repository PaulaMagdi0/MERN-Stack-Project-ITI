const multer = require("multer")

const fileStorege = multer.diskStorage({
  destination:(req,file,cb) =>{
  cb( null, "../public/images")
},
 filename:(req,file,cb) =>{
  cb(null, new Date().toISOString() + "-" + file.originalname)
 }
})
const fileFilter = (req,file ,cb )=>{
  if(
    file.mimetype ==='image/png'||
    file.mimetype ==='image/jpg'||
    file.mimetype ==='image/jpeg'
  ){
    cb(null,true)
  }
  else{
    cb(null,false)
  }
  

}