import { FormEvent } from "react";
import { ArrowRight, FlaskConical, Lock, Mail } from "lucide-react";

interface LoginScreenProps {
  onSignIn: () => void;
}

export function LoginScreen({ onSignIn }: LoginScreenProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSignIn();
  }

  return (
    <main className="grid min-h-screen grid-cols-[1.1fr_0.9fr] bg-white text-slate-950">
      <section className="flex flex-col justify-between bg-lab-700 px-16 py-14 text-white">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-md bg-white/12 ring-1 ring-white/20">
            <FlaskConical className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xl font-semibold">Eurolab Pro</p>
            <p className="text-sm text-lab-100">Laboratory Information Management System</p>
          </div>
        </div>

        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.26em] text-lab-100">Professional LIMS Desktop</p>
          <h1 className="mt-5 text-5xl font-semibold leading-tight">Control laboratory operations from one clean workspace.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-lab-100">
            Built for sample intake, analysis, reporting, exports, and audit-ready laboratory workflows.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm text-lab-100">
          <div className="rounded-md border border-white/15 bg-white/8 p-4">
            <p className="font-semibold text-white">Electron</p>
            <p className="mt-1">Native desktop shell</p>
          </div>
          <div className="rounded-md border border-white/15 bg-white/8 p-4">
            <p className="font-semibold text-white">SQLite</p>
            <p className="mt-1">Local data foundation</p>
          </div>
          <div className="rounded-md border border-white/15 bg-white/8 p-4">
            <p className="font-semibold text-white">React</p>
            <p className="mt-1">Modern interface</p>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center bg-slate-50 px-12">
        <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-panel">
          <div>
            <p className="text-sm font-medium text-lab-600">Welcome back</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">Sign in</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Enter your laboratory account details to open the workspace.</p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Email address</span>
              <span className="mt-2 flex h-12 items-center gap-3 rounded-md border border-slate-200 bg-white px-4 focus-within:border-lab-500 focus-within:ring-4 focus-within:ring-lab-50">
                <Mail className="h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
                  placeholder="name@laboratory.com"
                />
              </span>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Password</span>
              <span className="mt-2 flex h-12 items-center gap-3 rounded-md border border-slate-200 bg-white px-4 focus-within:border-lab-500 focus-within:ring-4 focus-within:ring-lab-50">
                <Lock className="h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
                  placeholder="Enter password"
                />
              </span>
            </label>

            <button className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-lab-600 text-sm font-semibold text-white transition hover:bg-lab-700">
              Open workspace
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
