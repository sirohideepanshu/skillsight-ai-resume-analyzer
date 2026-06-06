const multer = require("multer")
const path = require("path")
const { ensureUploadDirectories, primaryResumesRoot } = require("../utils/uploadPaths")

ensureUploadDirectories()

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, primaryResumesRoot)
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

const upload = multer({ storage })

module.exports = upload
