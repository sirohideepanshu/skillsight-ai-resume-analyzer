const multer = require("multer")
const fs = require("fs")
const path = require("path")

const uploadPath = path.join(__dirname, "../uploads/resumes")

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true })
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath)
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}.pdf`)
  }
})

const upload = multer({ storage })

module.exports = upload
