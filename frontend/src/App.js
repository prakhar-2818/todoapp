import { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./App.css";

const API = "https://todoapp-backend-w7ki.onrender.com/api/tasks";

function App() {
  const [title, setTitle] = useState("");
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const inputRef = useRef(null);

  const loadTodos = async () => {
    try {
      const res = await axios.get(API);
      setTodos(res.data);
    } catch (e) {
      console.error("loadTodos failed", e);
    }
  };

  const addTodo = async () => {
    if (title.trim() === "") {
      inputRef.current?.classList.add("shake");
      setTimeout(() => inputRef.current?.classList.remove("shake"), 400);
      return;
    }
    setLoading(true);
    try {
      await axios.post(API, { title });
      setTitle("");
      await loadTodos();
    } catch (e) {
      console.error("addTodo failed", e);
    } finally {
      setLoading(false);
    }
  };

  const deleteTodo = async (id) => {
    setDeletingId(id);
    setTimeout(async () => {
      try {
        await axios.delete(`${API}/${id}`);
        await loadTodos();
      } catch (e) {
        console.error("deleteTodo failed", e);
      } finally {
        setDeletingId(null);
      }
    }, 100);
  };

  const updateTodo = async (id, currentCompleted) => {
    const newCompleted = !currentCompleted;

    // 1. Update UI immediately — no waiting for network
    setTodos(prev =>
      prev.map(t => t._id === id ? { ...t, completed: newCompleted } : t)
    );

    // 2. Persist to backend in background
    try {
      await axios.put(`${API}/${id}`, { completed: newCompleted });
    } catch (e) {
      console.error("updateTodo failed", e);
      // Revert if backend call failed
      setTodos(prev =>
        prev.map(t => t._id === id ? { ...t, completed: currentCompleted } : t)
      );
    }
    // NOTE: No loadTodos() here — that was overwriting the optimistic state
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") addTodo();
  };

  useEffect(() => { loadTodos(); }, []);

  const completedCount = todos.filter((t) => t.completed).length;
  const progress = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;
  const allDone = todos.length > 0 && completedCount === todos.length;

  return (
    <div className="page">

      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
          </div>
          <span className="brand-text">TASKLY</span>
        </div>

        <div className="divider" />

        <nav className="nav">
          <div className="nav-item is-active">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1.5"/>
              <rect x="14" y="3" width="7" height="7" rx="1.5"/>
              <rect x="3" y="14" width="7" height="7" rx="1.5"/>
              <rect x="14" y="14" width="7" height="7" rx="1.5"/>
            </svg>
            All Tasks
            <span className="nbadge">{todos.length}</span>
          </div>
          <div className="nav-item">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            Pending
            <span className="nbadge amber">{todos.length - completedCount}</span>
          </div>
          <div className="nav-item">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Completed
            <span className="nbadge gold">{completedCount}</span>
          </div>
        </nav>

        <div className="sidebar-bottom">
          <div className="divider" />
          <div className="stat-row">
            <div className="stat">
              <span className="stat-n">{todos.length}</span>
              <span className="stat-l">Total</span>
            </div>
            <div className="stat">
              <span className="stat-n gold">{completedCount}</span>
              <span className="stat-l">Done</span>
            </div>
            <div className="stat">
              <span className="stat-n amber">{todos.length - completedCount}</span>
              <span className="stat-l">Left</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="main">

        {/* Topbar */}
        <header className="topbar">
          <div>
            <h1 className="pg-title">My Tasks</h1>
            <p className="pg-sub">
              {todos.length === 0
                ? "Nothing here yet — add your first task"
                : allDone
                ? "✦ All tasks complete!"
                : `${completedCount} of ${todos.length} completed`}
            </p>
          </div>

          {/* Circular ring */}
          <div className="ring-wrap">
            <svg width="64" height="64" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5"/>
              <circle
                cx="32" cy="32" r="26"
                fill="none"
                stroke={allDone ? "#f59e0b" : "#d97706"}
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray="163.36"
                strokeDashoffset={163.36 - (163.36 * progress) / 100}
                style={{
                  transform: "rotate(-90deg)",
                  transformOrigin: "center",
                  transition: "stroke-dashoffset 0.6s cubic-bezier(.34,1.4,.64,1), stroke 0.4s",
                  filter: allDone ? "drop-shadow(0 0 6px #f59e0b)" : "drop-shadow(0 0 4px #d97706)"
                }}
              />
            </svg>
            <span className="ring-pct">{progress}%</span>
          </div>
        </header>

        {/* Gold line progress */}
        <div className="pbar-track">
          <div className="pbar-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Input */}
        <div className="input-row">
          <input
            ref={inputRef}
            className="task-input"
            type="text"
            placeholder="Type a task and press Enter…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className={`add-btn${loading ? " loading" : ""}`}
            onClick={addTodo}
            disabled={loading}
          >
            {loading ? (
              <svg className="spin" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add Task
              </>
            )}
          </button>
        </div>

        {/* Section header */}
        {todos.length > 0 && (
          <div className="section-hdr">
            <span className="section-title">TASKS</span>
            <span className="section-count">{todos.length} total · {completedCount} done</span>
          </div>
        )}

        {/* List */}
        <div className="list">
          {todos.length === 0 && (
            <div className="empty">
              <div className="empty-icon">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <rect x="3" y="3" width="18" height="18" rx="3"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
              </div>
              <p>All clear! Add a task above to get started.</p>
            </div>
          )}

          {todos.map((todo, i) => (
            <div
              key={todo._id}
              className={`card${todo.completed ? " done" : ""}${deletingId === todo._id ? " exit" : ""}`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="card-accent" />

              <button
                className={`circle${todo.completed ? " ticked" : ""}`}
                onClick={() => updateTodo(todo._id, todo.completed)}
                aria-label="Toggle"
              >
                {todo.completed && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>

              <span className="task-text">{todo.title}</span>

              <span className={`pill ${todo.completed ? "p-done" : "p-open"}`}>
                {todo.completed ? "Done" : "Open"}
              </span>

              <button className="del-btn" onClick={() => deleteTodo(todo._id)} aria-label="Delete">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
















// import { useEffect, useState, useRef } from "react";
// import axios from "axios";
// import "./App.css";

// function App() {
//   const [title, setTitle] = useState("");
//   const [todos, setTodos] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [deletingId, setDeletingId] = useState(null);
//   const inputRef = useRef(null);

//   const addTodo = async () => {
//     if (title.trim() === "") {
//       inputRef.current?.classList.add("shake");
//       setTimeout(() => inputRef.current?.classList.remove("shake"), 400);
//       return;
//     }
//     setLoading(true);
//     await axios.post("https://todoapp-backend-w7ki.onrender.com/api/tasks", { title });
//     setTitle("");
//     await loadTodos();
//     setLoading(false);
//   };

//   const loadTodos = async () => {
//     const result = await axios.get("https://todoapp-backend-w7ki.onrender.com/api/tasks");
//     setTodos(result.data);
//   };

//   const deleteTodo = async (id) => {
//     setDeletingId(id);
//     setTimeout(async () => {
//       await axios.delete(`https://todoapp-backend-w7ki.onrender.com/api/tasks/${id}`);
//       await loadTodos();
//       setDeletingId(null);
//     }, 320);
//   };

//   const updateTodo = async (id, completed) => {
//     await axios.put(`https://todoapp-backend-w7ki.onrender.com/api/tasks/${id}`, { completed: !completed });
//     loadTodos();
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter") addTodo();
//   };

//   useEffect(() => { loadTodos(); }, []);

//   const completedCount = todos.filter((t) => t.completed).length;
//   const progress = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;
//   const allDone = todos.length > 0 && completedCount === todos.length;

//   return (
//     <div className="page">

//       {/* ── Sidebar ── */}
//       <aside className="sidebar">
//         <div className="brand">
//           <div className="brand-icon">
//             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
//               <path d="M9 11l3 3L22 4"/>
//               <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
//             </svg>
//           </div>
//           <span className="brand-text">TASKLY</span>
//         </div>

//         <div className="divider" />

//         <nav className="nav">
//           <div className="nav-item is-active">
//             <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//               <rect x="3" y="3" width="7" height="7" rx="1.5"/>
//               <rect x="14" y="3" width="7" height="7" rx="1.5"/>
//               <rect x="3" y="14" width="7" height="7" rx="1.5"/>
//               <rect x="14" y="14" width="7" height="7" rx="1.5"/>
//             </svg>
//             All Tasks
//             <span className="nbadge">{todos.length}</span>
//           </div>
//           <div className="nav-item">
//             <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//               <circle cx="12" cy="12" r="10"/>
//               <polyline points="12 6 12 12 16 14"/>
//             </svg>
//             Pending
//             <span className="nbadge amber">{todos.length - completedCount}</span>
//           </div>
//           <div className="nav-item">
//             <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//               <polyline points="20 6 9 17 4 12"/>
//             </svg>
//             Completed
//             <span className="nbadge gold">{completedCount}</span>
//           </div>
//         </nav>

//         <div className="sidebar-bottom">
//           <div className="divider" />
//           <div className="stat-row">
//             <div className="stat">
//               <span className="stat-n">{todos.length}</span>
//               <span className="stat-l">Total</span>
//             </div>
//             <div className="stat">
//               <span className="stat-n gold">{completedCount}</span>
//               <span className="stat-l">Done</span>
//             </div>
//             <div className="stat">
//               <span className="stat-n amber">{todos.length - completedCount}</span>
//               <span className="stat-l">Left</span>
//             </div>
//           </div>
//         </div>
//       </aside>

//       {/* ── Main ── */}
//       <main className="main">

//         {/* Topbar */}
//         <header className="topbar">
//           <div>
//             <h1 className="pg-title">My Tasks</h1>
//             <p className="pg-sub">
//               {todos.length === 0
//                 ? "Nothing here yet — add your first task"
//                 : allDone
//                 ? "✦ All tasks complete!"
//                 : `${completedCount} of ${todos.length} completed`}
//             </p>
//           </div>

//           {/* Circular ring */}
//           <div className="ring-wrap">
//             <svg width="64" height="64" viewBox="0 0 64 64">
//               <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5"/>
//               <circle
//                 cx="32" cy="32" r="26"
//                 fill="none"
//                 stroke={allDone ? "#f59e0b" : "#d97706"}
//                 strokeWidth="5"
//                 strokeLinecap="round"
//                 strokeDasharray="163.36"
//                 strokeDashoffset={163.36 - (163.36 * progress) / 100}
//                 style={{
//                   transform: "rotate(-90deg)",
//                   transformOrigin: "center",
//                   transition: "stroke-dashoffset 0.6s cubic-bezier(.34,1.4,.64,1), stroke 0.4s",
//                   filter: allDone ? "drop-shadow(0 0 6px #f59e0b)" : "drop-shadow(0 0 4px #d97706)"
//                 }}
//               />
//             </svg>
//             <span className="ring-pct">{progress}%</span>
//           </div>
//         </header>

//         {/* Gold line progress */}
//         <div className="pbar-track">
//           <div className="pbar-fill" style={{ width: `${progress}%` }} />
//         </div>

//         {/* Input */}
//         <div className="input-row">
//           <input
//             ref={inputRef}
//             className="task-input"
//             type="text"
//             placeholder="Type a task and press Enter…"
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//             onKeyDown={handleKeyDown}
//           />
//           <button
//             className={`add-btn${loading ? " loading" : ""}`}
//             onClick={addTodo}
//             disabled={loading}
//           >
//             {loading ? (
//               <svg className="spin" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
//                 <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
//               </svg>
//             ) : (
//               <>
//                 <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
//                   <line x1="12" y1="5" x2="12" y2="19"/>
//                   <line x1="5" y1="12" x2="19" y2="12"/>
//                 </svg>
//                 Add Task
//               </>
//             )}
//           </button>
//         </div>

//         {/* Section header */}
//         {todos.length > 0 && (
//           <div className="section-hdr">
//             <span className="section-title">TASKS</span>
//             <span className="section-count">{todos.length} total · {completedCount} done</span>
//           </div>
//         )}

//         {/* List */}
//         <div className="list">
//           {todos.length === 0 && (
//             <div className="empty">
//               <div className="empty-icon">
//                 <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
//                   <rect x="3" y="3" width="18" height="18" rx="3"/>
//                   <path d="M9 12l2 2 4-4"/>
//                 </svg>
//               </div>
//               <p>All clear! Add a task above to get started.</p>
//             </div>
//           )}

//           {todos.map((todo, i) => (
//             <div
//               key={todo._id}
//               className={`card${todo.completed ? " done" : ""}${deletingId === todo._id ? " exit" : ""}`}
//               style={{ animationDelay: `${i * 0.05}s` }}
//             >
//               {/* Left accent */}
//               <div className="card-accent" />

//               <button
//                 className={`circle${todo.completed ? " ticked" : ""}`}
//                 onClick={() => updateTodo(todo._id, todo.completed)}
//                 aria-label="Toggle"
//               >
//                 {todo.completed && (
//                   <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
//                     <polyline points="20 6 9 17 4 12"/>
//                   </svg>
//                 )}
//               </button>

//               <span className="task-text">{todo.title}</span>

//               <span className={`pill ${todo.completed ? "p-done" : "p-open"}`}>
//                 {todo.completed ? "Done" : "Open"}
//               </span>

//               <button className="del-btn" onClick={() => deleteTodo(todo._id)} aria-label="Delete">
//                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                   <polyline points="3 6 5 6 21 6"/>
//                   <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
//                   <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
//                 </svg>
//               </button>
//             </div>
//           ))}
//         </div>
//       </main>
//     </div>
//   );
// }

// export default App;
