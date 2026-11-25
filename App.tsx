import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link, NavLink, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, Boxes, Cloud, Container, FlaskConical, GitBranch, Hammer, Rocket, Undo2, Workflow, Eye, EyeOff, Check, LayoutDashboard, LogOut, Play, RefreshCw, Square } from "lucide-react";
import { api, errMsg, hasSession, setSession } from "./api";

const FLOW = ["GitHub", "Source Code", "Build", "Test", "Docker", "Deploy", "Monitor"];
const FEATURES: [string, string][] = [
  ["Automated builds", "Every push runs your build command in a throwaway container."],
  ["Continuous testing", "Your test command gates the pipeline. A failure stops it."],
  ["Docker packaging", "Passing builds become tagged images."],
  ["Honest status", "A stage is only green when it actually succeeded."]];

const CARDS: [any, string, string, string][] = [
  [Hammer, "Automated builds", "Every push builds in a throwaway container with no network and hard resource limits.", "#4388FF"],
  [FlaskConical, "Continuous testing", "Your test command is a gate. If it fails, the pipeline stops and nothing ships.", "#28D8E8"],
  [Container, "Docker packaging", "Passing builds become tagged images, tied to the exact run that made them.", "#875CF5"],
  [Cloud, "Health-checked deploys", "A deploy only turns green after your app answers a real HTTP health check.", "#20D6A0"],
  [Undo2, "Instant rollbacks", "Restore any earlier good version in one click. The live one stays up if it fails.", "#F5C451"],
  [Activity, "Live pipeline view", "Watch every stage change colour and read its logs as the run happens.", "#7C8CFF"]];
const STEPS = ["Connect your repo", "Push your code", "PipeLineX builds and tests", "Ship it, or roll it back"];
const CHIPS: [string, string][] = [["GitHub", "#4388FF"], ["Source Code", "#28D8E8"], ["Build", "#875CF5"], ["Test", "#7C8CFF"], ["Docker", "#F5C451"], ["Deploy", "#20D6A0"], ["Monitor", "#4388FF"]];

const TRACES = ["M0 180H260V320H600V190H980V400H1440", "M0 660H200V540H520V720H880V580H1440", "M420 0V110H760V250H1180V90H1440", "M1040 900V780H1260V640H1440", "M120 900V820H360V760"];
const NODES: [number, number][] = [[260, 180], [600, 320], [980, 190], [200, 660], [520, 540], [880, 720], [760, 110], [1180, 250], [1260, 780]];
function PipelineBg() {
  return <svg className="bgfx" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    {TRACES.map((d, i) => <g key={i}><path d={d} className="bt" /><path d={d} className="bp" pathLength={1000} style={{ animationDelay: `${-i * 2.4}s` }} /></g>)}
    {NODES.map(([x, y]) => <circle key={x + "-" + y} cx={x} cy={y} r={4} className="bn" />)}
  </svg>;
}

function Landing() {
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("in")), { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return <div className="land">
    <PipelineBg />
    <nav className="nav glass"><span className="brandlogo"><Workflow size={26} /><span>PipeLineX</span></span>
      <div className="row"><a href="#features" className="muted hide-sm">Features</a><a href="#how" className="muted hide-sm">How it works</a><Link to="/login" className="muted">Login</Link><Link to="/register" className="btn sm">Get Started</Link></div></nav>
    <section className="hero2">
      <div><div className="brand">
          <h1 className="wordmark" aria-label="PipeLineX"><span className="w1">Pipe</span><span className="w2">Line</span><span className="wx">X</span></h1>
          <div className="wireline"><i /></div>
          <p className="tagline"><span className="live" />Code. Build. Test. Deploy. Monitor.</p></div>
        <h2 className="headline">Automate Your <span className="grad">Development.</span> Accelerate Your <span className="grad2">Deployment.</span></h2>
        <p className="lead">From your first commit to production deployment, PipeLineX automates every step of your software delivery lifecycle.</p>
        <div className="row"><Link to="/register" className="btn big">Get Started</Link><a href="#features" className="btn ghost big">Explore Features</a></div></div>
      <div className="term3d" aria-hidden="true">
        <div className="dots"><i style={{ background: "#FF5B70" }} /><i style={{ background: "#F5C451" }} /><i style={{ background: "#20D6A0" }} /><span>pipeline #a41f9c02</span></div>
        {[["Source", "3f9a1c2", "ok"], ["Build", "12.4s", "ok"], ["Test", "48 passed", "ok"], ["Docker", "pipelinex/app:a41f9c02", "ok"], ["Deploy", "health check", "go"], ["Monitor", "waiting", "wait"]].map(([n, d, k], i) =>
          <div key={n} className={"tl " + k} style={{ animationDelay: `${0.4 + i * 0.5}s` }}><span className="tick" />{n}<em>{d}</em></div>)}
      </div></section>
    <div className="pipe" aria-label="Pipeline">{CHIPS.flatMap(([f, c], i) => [i ? <span key={"l" + i} className="wire" /> : null, <span key={f} className="chip" style={{ ["--c" as any]: c }}><i />{f}</span>])}</div>
    <section id="features" className="sec reveal"><h2 className="h2">Everything between <span className="grad">commit</span> and <span className="grad2">production</span></h2>
      <div className="cards">{CARDS.map(([Icon, t, d, c]) => <div className="fcard" key={t} style={{ ["--c" as any]: c }}><span className="ico"><Icon size={22} /></span><h3>{t}</h3><p className="muted">{d}</p></div>)}</div></section>
    <section id="how" className="sec reveal"><h2 className="h2">How it works</h2>
      <div className="steps">{STEPS.map((t, i) => <div className="step" key={t}><b style={{ ["--c" as any]: CHIPS[i * 2 % 7][1] }}>{i + 1}</b><span>{t}</span></div>)}</div></section>
    <section className="cta reveal"><h2>Ready to stop deploying by hand?</h2><p>Create an account and run your first pipeline in minutes.</p><Link to="/register" className="btn big light">Get Started Free</Link></section>
    <footer className="foot muted"><span className="brandlogo sm"><Workflow size={18} /><span>PipeLineX</span></span> – Automated CI/CD Deployment Platform</footer></div>;
}

const LIVE = ["Source", "Build", "Test", "Docker", "Deploy"];
function AuthSide() {
  const [n, setN] = useState(0);
  useEffect(() => { const t = setInterval(() => setN((x) => (x + 1) % (LIVE.length + 2)), 1100); return () => clearInterval(t); }, []);
  return <div className="aside">
    <Link to="/" className="brandlogo"><Workflow size={26} /><span>PipeLineX</span></Link>
    <h2>Ship with <span className="grad">confidence.</span></h2>
    <p className="muted">Every push is built, tested and health-checked before it goes live.</p>
    <div className="mini" aria-hidden="true">
      {LIVE.map((s, i) => <div key={s} className={"ml " + (i < n ? "done" : i === n ? "cur" : "")}><span className="tick" />{s}<em>{i < n ? "passed" : i === n ? "running" : "queued"}</em></div>)}
      <div className="mbar"><i style={{ width: `${(Math.min(n, LIVE.length) / LIVE.length) * 100}%` }} /></div></div>
  </div>;
}

function Auth({ mode }: { mode: "login" | "register" }) {
  const nav = useNavigate(); const reg = mode === "register";
  const [f, setF] = useState({ name: "", email: "", password: "", confirm: "" });
  const [e, setE] = useState(""); const [note, setNote] = useState(""); const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false); const [remember, setRemember] = useState(false); const [shake, setShake] = useState(false); const [ok, setOk] = useState(false);
  const set = (k: string) => (ev: any) => setF({ ...f, [k]: ev.target.value });
  const score = [f.password.length >= 8, /[A-Z]/.test(f.password), /\d/.test(f.password), /[^A-Za-z0-9]/.test(f.password)].filter(Boolean).length;
  const fail = (m: string) => { setE(m); setShake(true); setTimeout(() => setShake(false), 500); };
  async function submit(ev: FormEvent) {
    ev.preventDefault(); setE(""); setNote("");
    if (reg && f.password !== f.confirm) return fail("Passwords don't match");
    setBusy(true);
    try {
      const { data } = await api.post(`/auth/${mode}`, reg ? { name: f.name, email: f.email, password: f.password } : { email: f.email, password: f.password });
      setSession(data.token, remember); setOk(true); setTimeout(() => nav("/app"), 700);
    } catch (x) { fail(errMsg(x)); setBusy(false); }
  }
  return <div className="authpage"><PipelineBg />
    <div className="authwrap"><AuthSide />
      <div className={"authform" + (shake ? " shake" : "")}>
        <form className="aform" onSubmit={submit}>
          <h2>{reg ? "Create your account" : "Welcome back"}</h2>
          <p className="muted" style={{ margin: 0 }}>{reg ? "Start automating your deployments." : "Sign in to your dashboard."}</p>
          {reg && <div className="field"><label htmlFor="n">Full name</label><input id="n" required value={f.name} onChange={set("name")} autoComplete="name" /></div>}
          <div className="field"><label htmlFor="e">Email</label><input id="e" type="email" required value={f.email} onChange={set("email")} autoComplete="email" /></div>
          <div className="field"><label htmlFor="p">Password</label>
            <input id="p" type={show ? "text" : "password"} required minLength={reg ? 8 : 1} value={f.password} onChange={set("password")} autoComplete={reg ? "new-password" : "current-password"} />
            <button type="button" className="eye" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow(!show)}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            {reg && f.password && <><div className="meter">{[0, 1, 2, 3].map((i) => <i key={i} className={i < score ? "on" + score : ""} />)}</div><small className="muted">{["", "Weak", "Fair", "Good", "Strong"][score]} (8+ characters required)</small></>}</div>
          {reg && <div className="field"><label htmlFor="c">Confirm password</label><input id="c" type={show ? "text" : "password"} required value={f.confirm} onChange={set("confirm")} autoComplete="new-password" /></div>}
          {!reg && <div className="opts"><label><input type="checkbox" checked={remember} onChange={(ev) => setRemember(ev.target.checked)} />Remember me</label>
            <button type="button" className="linkbtn" onClick={() => setNote("Password reset by email isn't set up yet. Ask your workspace admin to reset it.")}>Forgot password?</button></div>}
          {note && <div className="note" role="status">{note}</div>}
          {e && <div className="err" role="alert">{e}</div>}
          <button className="btn submit" disabled={busy}>{ok ? <><Check size={16} />Welcome</> : busy ? <><span className="spin" />Please wait</> : reg ? "Create account" : "Sign in"}</button>
          <p className="muted" style={{ textAlign: "center", margin: "16px 0 0" }}>{reg ? <>Have an account? <Link to="/login" className="linkbtn">Sign in</Link></> : <>New here? <Link to="/register" className="linkbtn">Create an account</Link></>}</p>
        </form></div></div></div>;
}

function Overview() {
  const [s, setS] = useState<any>(null); const [e, setE] = useState("");
  useEffect(() => { api.get("/monitoring/summary").then((r) => setS(r.data)).catch((x) => setE(errMsg(x))); }, []);
  if (e) return <div className="err">{e}</div>; if (!s) return <p className="muted">Loading</p>;
  const stats: [string, any][] = [["Projects", s.projects], ["Pipeline runs", s.total], ["Successful", s.ok], ["Failed", s.failed], ["Deployments", s.deployments], ["Success rate", s.successRate == null ? "No finished runs" : s.successRate + "%"]];
  return <><h2>Overview</h2><div className="grid" style={{ margin: "16px 0" }}>{stats.map(([k, v]) => <div className="card stat" key={k}><span className="muted">{k}</span><b>{v}</b></div>)}</div>
    <div className="card"><h3>Successful vs failed</h3><div style={{ height: 220 }}><ResponsiveContainer><BarChart data={[{ n: "Successful", v: s.ok }, { n: "Failed", v: s.failed }]}><XAxis dataKey="n" stroke="#8B9BB5" /><YAxis allowDecimals={false} stroke="#8B9BB5" /><Tooltip /><Bar dataKey="v" fill="#4388FF" /></BarChart></ResponsiveContainer></div></div></>;
}

function Projects() {
  const [list, setList] = useState<any[]>([]); const [e, setE] = useState(""); const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: "", description: "", repoUrl: "", branch: "main", buildCmd: "npm run build", testCmd: "npm test", environment: "development" });
  const load = useCallback(() => api.get("/projects").then((r) => setList(r.data)).catch((x) => setE(errMsg(x))), []);
  useEffect(() => { load(); }, [load]);
  async function create(ev: FormEvent) { ev.preventDefault(); setE(""); try { await api.post("/projects", f); setOpen(false); load(); } catch (x) { setE(errMsg(x)); } }
  async function run(id: string) { try { await api.post("/pipelines/trigger", { projectId: id }); setE(""); alert("Pipeline queued. Open Pipelines to watch it."); } catch (x) { setE(errMsg(x)); } }
  async function del(id: string) { if (confirm("Delete this project and its pipeline history?")) { await api.delete(`/projects/${id}`); load(); } }
  const set = (k: string) => (ev: any) => setF({ ...f, [k]: ev.target.value });
  return <><div className="row" style={{ justifyContent: "space-between" }}><h2>Projects</h2><button className="btn" onClick={() => setOpen(!open)}>New project</button></div>
    {e && <div className="err" role="alert">{e}</div>}
    {open && <form className="card" onSubmit={create} style={{ margin: "16px 0" }}>
      <label>Project name</label><input required value={f.name} onChange={set("name")} />
      <label>Description</label><input value={f.description} onChange={set("description")} />
      <label>GitHub repository URL</label><input required type="url" placeholder="https://github.com/you/repo.git" value={f.repoUrl} onChange={set("repoUrl")} />
      <label>Branch</label><input value={f.branch} onChange={set("branch")} />
      <label>Build command</label><input value={f.buildCmd} onChange={set("buildCmd")} />
      <label>Test command</label><input value={f.testCmd} onChange={set("testCmd")} />
      <label>Environment</label><select value={f.environment} onChange={set("environment")}><option>development</option><option>staging</option><option>production</option></select>
      <button className="btn" style={{ marginTop: 16 }}>Create project</button></form>}
    {!list.length ? <p className="muted">No projects yet. Create one to connect a repository.</p> :
      <div className="grid" style={{ marginTop: 16 }}>{list.map((p) => <div className="card" key={p.id}><h3>{p.name}</h3><p className="muted">{p.repoUrl}<br />{p.branch} · {p.environment}</p>
        <div className="row"><button className="btn sm" onClick={() => run(p.id)}><Play size={12} /> Run pipeline</button><button className="btn ghost sm" onClick={() => del(p.id)}>Delete</button></div></div>)}</div>}</>;
}

function Pipelines() {
  const [list, setList] = useState<any[]>([]); const [sel, setSel] = useState<string | null>(null); const [logs, setLogs] = useState<any[]>([]); const [stage, setStage] = useState<string | null>(null); const [e, setE] = useState("");
  const load = useCallback(() => api.get("/pipelines").then((r) => setList(r.data)).catch((x) => setE(errMsg(x))), []);
  useEffect(() => { load(); const t = setInterval(load, 2000); return () => clearInterval(t); }, [load]);
  useEffect(() => { if (!sel) return; const g = () => api.get(`/pipelines/${sel}/logs`).then((r) => setLogs(r.data)).catch(() => {}); g(); const t = setInterval(g, 2000); return () => clearInterval(t); }, [sel]);
  const p = list.find((x) => x.id === sel);
  const act = (a: string) => api.post(`/pipelines/${sel}/${a}`).then(load).catch((x) => setE(errMsg(x)));
  const shown = logs.filter((l) => !stage || l.stage === stage);
  const dur = (s: any) => s.startedAt && s.endedAt ? ((+new Date(s.endedAt) - +new Date(s.startedAt)) / 1000).toFixed(1) + "s" : "";
  return <><h2>Pipelines</h2>{e && <div className="err" role="alert">{e}</div>}
    {!list.length ? <p className="muted">No runs yet. Run a pipeline from Projects.</p> : <div className="card wrap" style={{ margin: "16px 0" }}><table><thead><tr><th>Project</th><th>Commit</th><th>Status</th><th>Started</th></tr></thead><tbody>
      {list.map((x) => <tr key={x.id} onClick={() => { setSel(x.id); setStage(null); }} style={{ cursor: "pointer", background: x.id === sel ? "#0D1525" : undefined }}><td>{x.project.name}</td><td>{x.commitSha?.slice(0, 7) ?? "-"}</td><td className={"s-" + x.status}>{x.status}</td><td>{new Date(x.createdAt).toLocaleString()}</td></tr>)}</tbody></table></div>}
    {p && <div className="card"><div className="row" style={{ justifyContent: "space-between" }}><h3>Run {p.id.slice(-8)}</h3>
      <div className="row"><button className="btn ghost sm" disabled={!["PENDING", "RUNNING"].includes(p.status)} onClick={() => act("cancel")}><Square size={12} /> Cancel</button><button className="btn sm" onClick={() => act("retry")}><RefreshCw size={12} /> Retry</button></div></div>
      {p.error && <div className="err">{p.error}</div>}
      <div className="stages" style={{ margin: "16px 0" }}>{p.stages.map((s: any) => <button key={s.id} className={`stage s-${s.status} ${s.status === "RUNNING" ? "run" : ""}`} onClick={() => setStage(stage === s.name ? null : s.name)}><b>{s.name}</b><br /><small>{s.status} {dur(s)}</small></button>)}</div>
      <div className="term">{shown.length ? shown.map((l) => <div key={l.id} className={"L-" + l.level}>[{l.level}] {l.stage}: {l.message}</div>) : "No logs yet."}</div>
      <button className="btn ghost sm" style={{ marginTop: 8 }} onClick={() => navigator.clipboard.writeText(shown.map((l) => `[${l.level}] ${l.stage}: ${l.message}`).join("\n"))}>Copy logs</button></div>}</>;
}

function Deployments() {
  const [list, setList] = useState<any[]>([]); const [e, setE] = useState("");
  const load = useCallback(() => api.get("/deployments").then((r) => setList(r.data)).catch((x) => setE(errMsg(x))), []);
  useEffect(() => { load(); const t = setInterval(load, 3000); return () => clearInterval(t); }, [load]);
  async function rollback(d: any) {
    const cur = list.find((x) => x.active && x.environment === d.environment && x.pipeline.project.name === d.pipeline.project.name);
    if (!confirm(`Roll back ${d.pipeline.project.name} (${d.environment}) from ${cur ? cur.imageTag : "nothing"} to ${d.imageTag}?`)) return;
    try { await api.post(`/deployments/${d.id}/rollback`); setE(""); load(); } catch (x) { setE(errMsg(x)); }
  }
  return <><h2>Deployments</h2>{e && <div className="err" role="alert">{e}</div>}
    {!list.length ? <p className="muted" style={{ marginTop: 16 }}>No deployments yet. A pipeline that passes build, test and Docker creates one.</p> :
      <div className="card wrap" style={{ marginTop: 16 }}><table><thead><tr><th>Project</th><th>Image</th><th>Env</th><th>Type</th><th>Status</th><th>URL</th><th>When</th><th></th></tr></thead><tbody>
        {list.map((d) => <tr key={d.id}><td>{d.pipeline.project.name}</td><td>{d.imageTag}</td><td>{d.environment}</td><td>{d.kind}</td>
          <td className={d.status === "SUCCESS" ? "s-SUCCESS" : d.status === "FAILED" ? "s-FAILED" : "s-RUNNING"} title={d.error || ""}>{d.status}{d.active ? " (live)" : ""}</td>
          <td>{d.url && d.active ? d.url : "-"}</td><td>{new Date(d.createdAt).toLocaleString()}</td>
          <td>{!d.active && ["SUCCESS", "ROLLED_BACK"].includes(d.status) && !d.error && <button className="btn ghost sm" onClick={() => rollback(d)}>Restore</button>}</td></tr>)}</tbody></table></div>}</>;
}

function Shell() {
  const nav = useNavigate();
  if (!hasSession()) return <Navigate to="/login" />;
  const link = (to: string, Icon: any, t: string) => <NavLink to={to} end className={({ isActive }) => (isActive ? "on" : "")}><Icon size={16} />{t}</NavLink>;
  return <div className="shell"><aside className="side"><div className="logo" style={{ padding: "0 12px 16px" }}>PipeLineX</div>
    {link("/app", LayoutDashboard, "Overview")}{link("/app/projects", Boxes, "Projects")}{link("/app/pipelines", GitBranch, "Pipelines")}{link("/app/deployments", Rocket, "Deployments")}
    <button className="link" onClick={() => { api.post("/auth/logout").catch(() => {}); setSession(null); nav("/"); }}><LogOut size={16} />Log out</button></aside>
    <main className="main"><Routes><Route index element={<Overview />} /><Route path="projects" element={<Projects />} /><Route path="pipelines" element={<Pipelines />} /><Route path="deployments" element={<Deployments />} /></Routes></main></div>;
}

export default function App() {
  return <Routes><Route path="/" element={<Landing />} /><Route path="/login" element={<Auth mode="login" />} /><Route path="/register" element={<Auth mode="register" />} /><Route path="/app/*" element={<Shell />} /></Routes>;
}