const fs = require("fs")
const path = require("path")

const primaryUploadsRoot = path.join(__dirname, "../../uploads")
const primaryResumesRoot = path.join(primaryUploadsRoot, "resumes")
const legacyUploadsRoot = path.join(__dirname, "../uploads")
const legacyResumesRoot = path.join(legacyUploadsRoot, "resumes")

function ensureUploadDirectories() {
  if (!fs.existsSync(primaryResumesRoot)) {
    fs.mkdirSync(primaryResumesRoot, { recursive: true })
  }
}

function listResumeDirectories() {
  return Array.from(new Set([primaryResumesRoot, legacyResumesRoot]))
}

function resolveResumeFilePath(filenameOrPath) {
  const filename = path.basename(String(filenameOrPath || ""))

  for (const directory of listResumeDirectories()) {
    const candidatePath = path.join(directory, filename)
    if (fs.existsSync(candidatePath)) {
      return candidatePath
    }
  }

  return path.join(primaryResumesRoot, filename)
}

module.exports = {
  primaryUploadsRoot,
  primaryResumesRoot,
  legacyUploadsRoot,
  legacyResumesRoot,
  ensureUploadDirectories,
  resolveResumeFilePath
}
