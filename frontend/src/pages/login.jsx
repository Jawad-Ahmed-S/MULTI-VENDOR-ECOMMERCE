import { useState } from "react"
import { Link } from "react-router-dom"
import { useLogin } from "../api/user.js"
export default function Login() {
  const [credentials, setCredentials] = useState({ email: "", password: "" })
  const { mutate, isPending, isError, error } = useLogin()

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("in the handleSubmit function")
    mutate(credentials)
  }

  return (
    <>
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-surface border border-border rounded-lg p-6 md:p-8">
        <p className="font-display text-ink text-[28px] font-semibold leading-tight mb-1">Welcome back</p>
        <p className="text-ink-muted text-sm mb-6">Log in to your account to continue.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="block text-brand text-[13px] font-medium mb-1.5">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={credentials.email}
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
              value={credentials.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full h-11 bg-background border border-border rounded-md px-3 text-sm text-ink placeholder:text-ink-muted outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft"
            />
          </div>

          {isError && (
            <>
              {console.error("Login failed:", error)}
              <p className="bg-danger-soft text-danger-text rounded-md px-3 py-2 text-[13px]">
                {error?.response?.data?.message || "Couldn't log in. Check your details and try again."}
              </p>
            </>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="h-11 bg-accent text-white rounded-md text-sm font-medium mt-2 disabled:opacity-60"
          >
            {isPending ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="text-ink-muted text-[13px] mt-6 text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-accent-text font-medium">
            Create one
          </Link>
        </p>
      </div>
      </div>
      </>
  )
}