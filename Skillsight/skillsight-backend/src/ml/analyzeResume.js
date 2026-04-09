const fs = require("fs")
const path = require("path")
const axios = require("axios")
const pdf = require("pdf-parse")

const ML_API_URL = process.env.ML_API_URL || "https://skillsight-ml.onrender.com/analyze-resume"

function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === "string" && item.trim())
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}

function normalizeSkillWeights(skillWeights) {
  if (!skillWeights) return {}

  if (typeof skillWeights === "string") {
    try {
      const parsed = JSON.parse(skillWeights)
      return parsed && typeof parsed === "object" ? parsed : {}
    } catch {
      return {}
    }
  }

  return typeof skillWeights === "object" ? skillWeights : {}
}

function extractDescriptionSkills(description = "") {
  const match = String(description).match(/required skills:\s*(.+)$/im)
  if (!match) return []

  return match[1]
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

function runLocalAnalysis(text, job = {}) {
  const normalizedText = String(text || "").toLowerCase()
  const skillWeights = normalizeSkillWeights(job.skill_weights)
  const weightedSkills = Object.entries(skillWeights)
    .map(([skill, weight]) => ({
      skill,
      weight: Number.isFinite(Number(weight)) ? Number(weight) : 0
    }))
    .filter(({ skill }) => Boolean(skill))

  const fallbackSkills =
    weightedSkills.length > 0
      ? weightedSkills.map(({ skill }) => skill)
      : extractDescriptionSkills(job.description || "")

  const candidates =
    weightedSkills.length > 0
      ? weightedSkills
      : fallbackSkills.map((skill) => ({ skill, weight: 1 }))

  const detected_skills = []
  const missing_skills = []
  let matchedWeight = 0
  let totalWeight = 0

  for (const { skill, weight } of candidates) {
    const normalizedSkill = String(skill).trim().toLowerCase()
    if (!normalizedSkill) continue

    const effectiveWeight = weight > 0 ? weight : 1
    totalWeight += effectiveWeight

    if (normalizedText.includes(normalizedSkill)) {
      detected_skills.push(skill)
      matchedWeight += effectiveWeight
    } else {
      missing_skills.push(skill)
    }
  }

  let score = 0
  if (totalWeight > 0) {
    score = Math.round((matchedWeight / totalWeight) * 100)
  } else if (normalizedText.length > 0) {
    score = 50
  }

  const suggestions =
    missing_skills.length > 0
      ? [`Add stronger evidence for: ${missing_skills.slice(0, 5).join(", ")}.`]
      : ["Resume aligns with the detected requirements."]

  return {
    score,
    detected_skills,
    missing_skills,
    suggestions,
    fallback: true,
    fallback_reason: "Remote ML unavailable, using local keyword analysis",
    min_match_score: Number(job.min_match_score ?? 75),
    min_experience_years: Number(job.min_experience_years ?? 0)
  }
}

async function analyzeResume(filePath, job = {}) {
  if (!fs.existsSync(filePath)) {
    throw new Error("Resume file not found")
  }

  const dataBuffer = fs.readFileSync(filePath)
  const data = await pdf(dataBuffer)
  const text = (data.text || "").trim()

  if (!text) {
    throw new Error("Resume text extraction failed")
  }

  try {
    const response = await axios.post(
      ML_API_URL,
      {
        resume_text: text,
        job_description: job.description || "",
        skill_weights: normalizeSkillWeights(job.skill_weights)
      },
      {
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 20000
      }
    )

    const payload = response.data || {}

    return {
      score: Number.isFinite(Number(payload.score)) ? Number(payload.score) : 0,
      detected_skills: normalizeArray(payload.detected_skills),
      missing_skills: normalizeArray(payload.missing_skills),
      suggestions: normalizeArray(payload.suggestions),
      fallback: false,
      min_match_score: Number(job.min_match_score ?? 75),
      min_experience_years: Number(job.min_experience_years ?? 0),
      extracted_text: text
    }
  } catch (error) {
    console.error("ML API request failed:", error.response?.data || error.message)

    return {
      ...runLocalAnalysis(text, job),
      extracted_text: text
    }
  }
}

function buildStoredResumeUrl(filenameOrPath) {
  const filename = path.basename(String(filenameOrPath || ""))
  return `/api/uploads/resumes/${filename}`
}

function buildResumeFilePath(filenameOrPath) {
  const filename = path.basename(String(filenameOrPath || ""))
  return path.join(__dirname, "../uploads/resumes", filename)
}

module.exports = {
  analyzeResume,
  buildStoredResumeUrl,
  buildResumeFilePath
}
