import { useState, useRef } from "react"
import DashboardLayout from "../layouts/DashboardLayout.jsx"
import API from "../services/api"
import { getAuthToken } from "../utils/authSession"

const MAX_SIZE = 10 * 1024 * 1024 // 10MB

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function ResumeUpload() {

  const inputRef = useRef(null)

  const [file, setFile] = useState(null)
  const [jobId, setJobId] = useState("")
  const [isDragging, setIsDragging] = useState(false)

  const [status, setStatus] = useState("idle") // idle | uploading | success | error
  const [error, setError] = useState(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)

    const dropped = e.dataTransfer.files[0]

    if (dropped) validateAndSet(dropped)
  }

  const handleSelect = (e) => {
    const selected = e.target.files?.[0]

    if (selected) validateAndSet(selected)

    e.target.value = ""
  }

  const validateAndSet = (f) => {

    setError(null)

    if (!f.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload a PDF file.")
      return
    }

    if (f.size > MAX_SIZE) {
      setError("File must be under 10 MB.")
      return
    }

    setFile(f)
    setStatus("idle")
  }

  const handleRemove = () => {
    setFile(null)
    setStatus("idle")
    setError(null)
  }

  const handleUpload = async () => {

  if (!file) return
  if (!jobId) {
    setError("Please enter Job ID")
    return
  }

  try {

    setStatus("uploading")
    setError(null)

    const formData = new FormData()

    formData.append("resume", file)
    formData.append("jobId", jobId)

    const token = getAuthToken()

const res = await API.post("/resumes/upload", formData, {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "multipart/form-data"
  }
})

    if (res.data?.analysis_error) {
      setStatus("error")
      setError(`${res.data.message}. ${res.data.analysis_error}`)
    } else {
      setStatus("success")
    }

  } catch (err) {

    console.error(err)

    setStatus("error")
    setError(
      err.response?.data?.error ||
      err.response?.data?.message ||
      "Upload failed"
    )

  }
}

  return (

    <DashboardLayout pageTitle="Upload Resume">

      <div className="flex justify-center">

        <div className="w-full max-w-xl space-y-6">

          {/* Job ID */}

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">

            <label className="text-sm font-medium">
              Job ID
            </label>

            <input
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              placeholder="Enter Job ID"
              className="w-full mt-2 border rounded-xl px-3 py-2"
            />

          </div>

          {/* Drop zone */}

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`rounded-2xl border-2 border-dashed p-12 transition-colors ${
              isDragging
                ? "border-indigo-400 bg-slate-50 dark:bg-slate-800/50"
                : "border-slate-300 dark:border-slate-700"
            }`}
          >

            <input
              ref={inputRef}
              type="file"
              accept=".pdf"
              onChange={handleSelect}
              className="hidden"
            />

            <div className="flex flex-col items-center gap-4 text-center">

              <p className="text-sm font-medium">
                Drag and drop your resume here
              </p>

              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="px-5 py-2 rounded-xl border"
              >
                Choose file
              </button>

            </div>

          </div>

          {/* File preview */}

          {(file || error) && (

            <div className="rounded-xl border p-6 space-y-4">

              {file && (

                <div className="flex justify-between">

                  <div>

                    <p className="font-medium">{file.name}</p>

                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>

                  </div>

                  {status === "idle" && (

                    <button
                      onClick={handleRemove}
                      className="text-red-400"
                    >
                      Remove
                    </button>

                  )}

                </div>

              )}

              {error && (

                <p className="text-red-500 text-sm">
                  {error}
                </p>

              )}

              {/* Status */}

              {status === "uploading" && (
                <p className="text-amber-500">Uploading...</p>
              )}

              {status === "success" && (
                <p className="text-green-500">
                  Resume uploaded and analyzed!
                </p>
              )}

              {status === "error" && (
                <p className="text-red-500">
                  Upload failed
                </p>
              )}

              {file && status === "idle" && (

                <button
                  onClick={handleUpload}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl"
                >
                  Upload Resume
                </button>

              )}

            </div>

          )}

        </div>

      </div>

    </DashboardLayout>

  )
}
