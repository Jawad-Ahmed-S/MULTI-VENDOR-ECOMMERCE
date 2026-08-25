import { useRef, useState } from "react"
import { Link } from "react-router-dom"
import { useRegister } from "../api/user.js"

export default function Register() {
  const [user, setUser] = useState({ name: "", email: "", password: "" })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const fileInputRef = useRef(null)
  const { mutate, isPending, isError, error } = useRegister()

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value })
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append("name", user.name)
    formData.append("email", user.email)
    formData.append("password", user.password)
    if (avatarFile) formData.append("image", avatarFile)
    mutate(formData)
  }
   return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-surface border border-border rounded-lg p-6 md:p-8">
        <p className="font-display text-ink text-[28px] font-semibold leading-tight mb-1">Create your account</p>
        <p className="text-ink-muted text-sm mb-6">Join the marketplace to start buying or selling.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex justify-center mb-1">
            <div className="relative w-24 h-24">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 rounded-full bg-surface-muted border border-border overflow-hidden flex items-center justify-center"
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                ) : (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink-muted">
                    <path d="M20 21a8 8 0 0 0-16 0" strokeLinecap="round" />
                    <circle cx="12" cy="8" r="4" />
                  </svg>
                )}
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Change photo"
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center border-2 border-surface"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2Z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              /> 
            </div>
          </div>

          <div>
            <label htmlFor="name" className="block text-brand text-[13px] font-medium mb-1.5">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={user.name}
              onChange={handleChange}
              placeholder="Jordan Lee"
              className="w-full h-11 bg-background border border-border rounded-md px-3 text-sm text-ink placeholder:text-ink-muted outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-brand text-[13px] font-medium mb-1.5">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={user.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full h-11 bg-background border border-border rounded-md px-3 text-sm text-ink placeholder:text-ink-muted outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-brand text-[13px] font-medium mb-1.5">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={user.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full h-11 bg-background border border-border rounded-md px-3 text-sm text-ink placeholder:text-ink-muted outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft"
            />
          </div>

          {isError && (
            <>
              {console.error("Register failed:", error)}
              <p className="bg-danger-soft text-danger-text rounded-md px-3 py-2 text-[13px]">
                {error?.response?.data?.message || "Couldn't create your account. Try again."}
              </p>
            </>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="h-11 bg-accent text-white rounded-md text-sm font-medium mt-2 disabled:opacity-60"
          >
            {isPending ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-ink-muted text-[13px] mt-6 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-accent-text font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}