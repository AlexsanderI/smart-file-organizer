function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-6 py-8">
      <div className="mx-auto max-w-5xl rounded-3xl border border-slate-800 bg-slate-900/90 p-10 shadow-2xl shadow-slate-900/40">
        <header className="space-y-4">
          <h1 className="text-4xl font-semibold">Smart File Organizer</h1>
          <p className="text-slate-400">
            Phase 1 MVP: select a folder, preview detected files, and move
            selected files into a clean structure.
          </p>
        </header>

        <main className="mt-10 space-y-6">
          <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
            <h2 className="text-xl font-medium">Welcome</h2>
            <p className="mt-2 text-slate-400">
              This desktop app will scan a folder and organize files by
              extension into a predictable folder layout.
            </p>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
              <h3 className="text-lg font-medium">Next step</h3>
              <p className="mt-2 text-slate-400">
                Implement folder selection and preview table in the next Phase 1
                iteration.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
              <h3 className="text-lg font-medium">Runtime</h3>
              <p className="mt-2 text-slate-400">
                Electron will host this React app in a desktop window.
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
