const multer = require('multer')
const fs = require('fs')
const path = require('path')

const resumesDirectory = path.join(__dirname, "..", "uploads", "resumes")

if (!fs.existsSync(resumesDirectory)) {
  fs.mkdirSync(resumesDirectory, { recursive: true })
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, resumesDirectory)
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname)
    cb(null, uniqueName)
  }
})

const upload = multer({ storage })

module.exports = upload 
