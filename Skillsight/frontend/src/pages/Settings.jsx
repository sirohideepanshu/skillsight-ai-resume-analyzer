import { useEffect, useMemo, useState } from "react"
import DashboardLayout from "../layouts/DashboardLayout.jsx"
import API from "../services/api"
import {
  getAuthToken,
  getSessionItem,
  updateProfileSession
} from "../utils/authSession"

export default function Settings() {
  const [role, setRole] = useState(getSessionItem("userRole") || "student")
  const [name, setName] = useState(getSessionItem("userName") || "")
  const [photo, setPhoto] = useState("")
  const [selectedFileName, setSelectedFileName] = useState("")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = getAuthToken()
        const res = await API.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        })

        const nextUser = res.data?.user || {}
        const nextPhoto = nextUser.profile_photo || ""
        const nextName = nextUser.name || ""
        const nextRole = nextUser.role || "student"

        setPhoto(nextPhoto)
        setName(nextName)
        setRole(nextRole)

        updateProfileSession({
          profilePhoto: nextPhoto,
          userName: nextName,
          userRole: nextRole
        })
      } catch (error) {
        console.error("Failed to load profile:", error)
      }
    }

    loadProfile()
  }, [])

  const initials = useMemo(() => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  }, [name])

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setSelectedFileName(file.name)
    setMessage("")

    const reader = new FileReader()
    reader.onloadend = () => {
      const result = typeof reader.result === "string" ? reader.result : ""
      setPhoto(result)
    }
    reader.readAsDataURL(file)
  }

  const savePhoto = async () => {
    try {
      setSaving(true)
      setMessage("")
      const token = getAuthToken()
      const res = await API.patch(
        "/auth/me",
        { profile_photo: photo || null },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const nextUser = res.data?.user || {}
      updateProfileSession({
        profilePhoto: nextUser.profile_photo || "",
        userName: nextUser.name || name,
        userRole: nextUser.role || role
      })
      setMessage("Profile photo saved successfully.")
    } catch (error) {
      console.error("Failed to save profile photo:", error)
      setMessage("Failed to save profile photo.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout pageTitle="Settings">
      <div className="space-y-6">
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_360px]">
          <div className="rounded-[32px] border border-slate-800 bg-slate-900/65 p-6 shadow-[0_30px_120px_-70px_rgba(34,211,238,0.7)] sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">Profile settings</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-4xl">
              Keep your account identity clean and current.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              Update the profile image used across the workspace.
            </p>
          </div>

          <div className="rounded-[32px] border border-slate-800 bg-slate-900/65 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">Account</p>
            <div className="mt-6 space-y-4">
              <InfoRow label="Name" value={name || "SkillSight user"} />
              <InfoRow
                label="Role"
                value={role === "recruiter" ? "Recruiter account" : "Student account"}
              />
              <InfoRow label="Photo state" value={photo ? "Preview ready" : "Using fallback avatar"} />
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="rounded-[32px] border border-slate-800 bg-slate-900/65 p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">Preview</p>
            <div className="mt-6 flex flex-col items-center rounded-[28px] border border-slate-800 bg-slate-950/75 px-6 py-8 text-center">
              {photo ? (
                <img
                  src={photo}
                  alt="Profile preview"
                  className="h-32 w-32 rounded-[28px] object-cover ring-2 ring-cyan-400/20"
                />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-[28px] border border-cyan-400/20 bg-cyan-400/10 text-3xl font-semibold text-cyan-200">
                  {initials || "SS"}
                </div>
              )}

              <p className="mt-5 text-lg font-semibold text-white">{name || "SkillSight user"}</p>
              <p className="mt-1 text-sm text-slate-400">
                {role === "recruiter" ? "Recruiter account" : "Student account"}
              </p>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-800 bg-slate-900/65 p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">Profile photo</p>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  Upload a better account image
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                  Use a clear image so your dashboard identity feels real and consistent in recruiter and student views.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-[28px] border border-slate-800 bg-slate-950/75 p-5">
              <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3.5 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:text-white">
                Choose image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              <p className="mt-4 text-sm text-slate-500">
                {selectedFileName || "No file selected yet"}
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={savePhoto}
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-2xl bg-cyan-400 px-5 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save photo"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPhoto("")
                    setSelectedFileName("")
                    setMessage("")
                  }}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3.5 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
                >
                  Reset preview
                </button>
              </div>
            </div>

            {message && (
              <div
                className={`mt-6 rounded-2xl border px-4 py-4 text-sm ${
                  message.toLowerCase().includes("failed")
                    ? "border-rose-400/20 bg-rose-400/10 text-rose-200"
                    : "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                }`}
              >
                {message}
              </div>
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/75 px-4 py-4">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  )
}
