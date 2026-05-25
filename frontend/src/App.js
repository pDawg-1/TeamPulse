import React, { useState } from "react";

import {
  DragDropContext,
  Droppable,
  Draggable,
} from "react-beautiful-dnd";

function App() {

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showBoard, setShowBoard] =
    useState(false);

  const [tasks, setTasks] =
    useState([]);

  const [newTask, setNewTask] =
    useState("");

  const [priority, setPriority] =
    useState("MEDIUM");

  const [dueDate, setDueDate] =
    useState("");

  const BOARD_ID = 1;

  // -----------------------------
  // LOGIN
  // -----------------------------
  const loginAndLoadDashboard =
    async () => {

      try {

        const response =
          await fetch(
            "http://127.0.0.1:5000/login",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                email,
                password,
              }),
            }
          );

        const data =
          await response.json();

        if (data.token) {

          localStorage.setItem(
            "token",
            data.token
          );

          setShowBoard(true);

          const tasksResponse =
            await fetch(
              `http://127.0.0.1:5000/boards/${BOARD_ID}/tasks`,
              {
                headers: {
                  Authorization:
                    `Bearer ${data.token}`,
                },
              }
            );

          const tasksData =
            await tasksResponse.json();

          setTasks(tasksData);

        } else {

          alert(
            data.message ||
            "Login Failed"
          );
        }

      } catch (error) {

        console.error(error);

        alert("Server Error");
      }
    };

  // -----------------------------
  // ADD TASK
  // -----------------------------
  const addTask = async () => {

    if (!newTask.trim()) {

      alert("Enter task");

      return;
    }

    const token =
      localStorage.getItem("token");

    try {

      const response =
        await fetch(
          `http://127.0.0.1:5000/boards/${BOARD_ID}/tasks`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              title: newTask,
              description: "",
              status: "TODO",
              priority: priority,
              due_date: dueDate,
            }),
          }
        );

      const data =
        await response.json();

      if (response.ok) {

        setTasks([
          ...tasks,
          data,
        ]);

        setNewTask("");

        setPriority("MEDIUM");

        setDueDate("");

      } else {

        alert(
          data.message ||
          "Task creation failed"
        );
      }

    } catch (error) {

      console.error(error);

      alert("Server Error");
    }
  };

  // -----------------------------
  // DRAG DROP
  // -----------------------------
  const onDragEnd = (result) => {

    if (!result.destination)
      return;

    const updatedTasks =
      tasks.map((task) => {

        if (
          String(task.id) ===
          result.draggableId
        ) {

          return {
            ...task,

            status:
              result.destination
                .droppableId,
          };
        }

        return task;
      });

    setTasks(updatedTasks);
  };

  // -----------------------------
  // DELETE TASK
  // -----------------------------
  const deleteTask =
    async (id) => {

      const token =
        localStorage.getItem(
          "token"
        );

      try {

        const response =
          await fetch(
            `http://127.0.0.1:5000/tasks/${id}`,
            {
              method:
                "DELETE",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        if (response.ok) {

          const updated =
            tasks.filter(
              (task) =>
                task.id !== id
            );

          setTasks(updated);

        }

      } catch (error) {

        console.error(error);
      }
    };

  return (

    <div style={styles.container}>

      {!showBoard ? (

        <div
          style={
            styles.loginWrapper
          }
        >

          <form
            style={styles.card}

            onSubmit={(e) => {

              e.preventDefault();

              loginAndLoadDashboard();
            }}
          >

            <div
              style={
                styles.logoCircle
              }
            >
              ⚡
            </div>

            <h1
              style={
                styles.heading
              }
            >
              TeamPulse
            </h1>

            <p
              style={
                styles.subheading
              }
            >
              AI Powered Workflow
              Dashboard
            </p>

            <input
              type="email"
              placeholder="Enter Email"
              value={email}

              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }

              style={styles.input}
            />

            <input
              type="password"
              placeholder="Enter Password"
              value={password}

              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }

              style={styles.input}
            />

            <button
              type="submit"
              style={styles.button}
            >
              Launch Dashboard
            </button>

          </form>

        </div>

      ) : (

        <div
          style={
            styles.dashboard
          }
        >

          {/* HEADER */}

          <div
            style={
              styles.topbar
            }
          >

            <div>

              <h1
                style={
                  styles.dashboardTitle
                }
              >
                TeamPulse ⚡
              </h1>

              <p
                style={
                  styles.dashboardText
                }
              >
                Organize your work
                beautifully
              </p>

            </div>

          </div>

          {/* ANALYTICS */}

          <div
            style={
              styles.analyticsContainer
            }
          >

            <div
              style={
                styles.analyticsCard
              }
            >
              <h3>Total Tasks</h3>
              <p>{tasks.length}</p>
            </div>

            <div
              style={
                styles.analyticsCard
              }
            >
              <h3>Completed</h3>

              <p>
                {
                  tasks.filter(
                    (task) =>
                      task.status ===
                      "DONE"
                  ).length
                }
              </p>

            </div>

            <div
              style={
                styles.analyticsCard
              }
            >
              <h3>Pending</h3>

              <p>
                {
                  tasks.filter(
                    (task) =>
                      task.status !==
                      "DONE"
                  ).length
                }
              </p>

            </div>

            <div
              style={
                styles.analyticsCard
              }
            >
              <h3>High Priority</h3>

              <p>
                {
                  tasks.filter(
                    (task) =>
                      task.priority ===
                      "HIGH"
                  ).length
                }
              </p>

            </div>

          </div>

          {/* TASK CREATOR */}

          <div
            style={
              styles.taskCreator
            }
          >

            <input
              type="text"
              placeholder="Create New Task"
              value={newTask}

              onChange={(e) =>
                setNewTask(
                  e.target.value
                )
              }

              style={styles.input}
            />

            <select
              value={priority}

              onChange={(e) =>
                setPriority(
                  e.target.value
                )
              }

              style={styles.select}
            >

              <option value="HIGH">
                High Priority
              </option>

              <option value="MEDIUM">
                Medium Priority
              </option>

              <option value="LOW">
                Low Priority
              </option>

            </select>

            <input
              type="date"
              value={dueDate}

              onChange={(e) =>
                setDueDate(
                  e.target.value
                )
              }

              style={styles.input}
            />

            <button
              onClick={addTask}
              style={styles.button}
            >
              Add Task
            </button>

          </div>

          {/* KANBAN */}

          <DragDropContext
            onDragEnd={onDragEnd}
          >

            <div
              style={
                styles.kanbanContainer
              }
            >

              {[
                "TODO",
                "IN_PROGRESS",
                "DONE",
              ].map((column) => (

                <Droppable
                  droppableId={column}
                  key={column}
                >

                  {(provided) => (

                    <div
                      ref={
                        provided.innerRef
                      }

                      {
                        ...provided.droppableProps
                      }

                      style={
                        styles.column
                      }
                    >

                      <h2
                        style={
                          styles.columnTitle
                        }
                      >
                        {
                          column ===
                          "IN_PROGRESS"
                            ? "IN PROGRESS"
                            : column
                        }
                      </h2>

                      {tasks
                        .filter(
                          (task) =>
                            task.status ===
                            column
                        )

                        .map(
                          (
                            task,
                            index
                          ) => (

                            <Draggable
                              key={task.id}
                              draggableId={String(
                                task.id
                              )}
                              index={index}
                            >

                              {(
                                provided
                              ) => (

                                <div
                                  ref={
                                    provided.innerRef
                                  }

                                  {
                                    ...provided.draggableProps
                                  }

                                  {
                                    ...provided.dragHandleProps
                                  }

                                  style={{
                                    ...styles.taskCard,

                                    ...provided
                                      .draggableProps
                                      .style,
                                  }}
                                >

                                  <div
                                    style={{
                                      display:
                                        "flex",

                                      justifyContent:
                                        "space-between",
                                    }}
                                  >

                                    <strong>
                                      {
                                        task.title
                                      }
                                    </strong>

                                    <button
                                      onClick={() =>
                                        deleteTask(
                                          task.id
                                        )
                                      }

                                      style={
                                        styles.deleteBtn
                                      }
                                    >
                                      ✕
                                    </button>

                                  </div>

                                  <p
                                    style={{
                                      marginTop:
                                        "12px",

                                      color:
                                        task.priority ===
                                        "HIGH"
                                          ? "#fb7185"
                                          : task.priority ===
                                            "MEDIUM"
                                          ? "#facc15"
                                          : "#4ade80",
                                    }}
                                  >
                                    {
                                      task.priority
                                    }
                                  </p>

                                  <p
                                    style={{
                                      color:
                                        "#cbd5e1",

                                      marginTop:
                                        "10px",
                                    }}
                                  >
                                    Due:{" "}
                                    {
                                      task.due_date
                                    }
                                  </p>

                                </div>

                              )}

                            </Draggable>

                          )
                        )}

                      {
                        provided.placeholder
                      }

                    </div>

                  )}

                </Droppable>

              ))}

            </div>

          </DragDropContext>

        </div>

      )}

    </div>

  );
}

const styles = {

  container: {
    minHeight: "100vh",

    background:
      "linear-gradient(135deg,#0f0c29,#302b63,#24243e)",

    fontFamily:
      "Inter, sans-serif",

    padding:
      "30px 20px",
  },

  loginWrapper: {
    display: "flex",

    justifyContent:
      "center",

    alignItems:
      "center",

    minHeight: "100vh",
  },

  dashboard: {
    width: "100%",
  },

  topbar: {
    marginBottom:
      "35px",
  },

  dashboardTitle: {
    color: "#ffffff",

    fontSize: "52px",

    marginBottom:
      "8px",

    fontWeight:
      "800",

    letterSpacing:
      "-2px",
  },

  dashboardText: {
    color: "#cbd5e1",

    fontSize: "16px",
  },

  logoCircle: {
    width: "80px",

    height: "80px",

    borderRadius: "50%",

    background:
      "linear-gradient(135deg,#7c3aed,#06b6d4)",

    display: "flex",

    justifyContent:
      "center",

    alignItems:
      "center",

    margin:
      "0 auto 25px auto",

    fontSize: "34px",

    color: "white",

    boxShadow:
      "0 0 40px rgba(139,92,246,0.6)",
  },

  card: {
    width: "450px",

    padding: "55px",

    borderRadius:
      "34px",

    background:
      "rgba(15,23,42,0.7)",

    backdropFilter:
      "blur(18px)",

    border:
      "1px solid rgba(255,255,255,0.08)",

    boxShadow:
      "0 0 60px rgba(139,92,246,0.28)",

    textAlign:
      "center",
  },

  heading: {
    color: "#ffffff",

    fontSize: "58px",

    marginBottom:
      "10px",

    fontWeight:
      "800",

    letterSpacing:
      "-3px",
  },

  subheading: {
    color: "#cbd5e1",

    marginBottom:
      "35px",

    fontSize: "16px",
  },

  input: {
    width: "100%",

    padding: "16px",

    marginBottom:
      "18px",

    borderRadius:
      "16px",

    border:
      "1px solid rgba(255,255,255,0.08)",

    outline: "none",

    fontSize: "15px",

    background:
      "rgba(15,23,42,0.92)",

    color: "#ffffff",

    boxSizing:
      "border-box",

    backdropFilter:
      "blur(12px)",
  },

  select: {
    width: "100%",

    padding: "16px",

    marginBottom:
      "18px",

    borderRadius:
      "16px",

    border:
      "1px solid rgba(255,255,255,0.08)",

    outline: "none",

    fontSize: "15px",

    background:
      "#111827",

    color: "#ffffff",

    boxSizing:
      "border-box",

    cursor: "pointer",
  },

  button: {
    width: "100%",

    padding: "16px",

    background:
      "linear-gradient(135deg,#7c3aed,#06b6d4)",

    color: "white",

    border: "none",

    borderRadius:
      "16px",

    cursor: "pointer",

    fontSize: "16px",

    fontWeight:
      "700",

    boxShadow:
      "0 0 35px rgba(124,58,237,0.45)",

    transition:
      "0.3s ease",
  },

  analyticsContainer: {
    display: "flex",

    gap: "20px",

    marginBottom:
      "35px",

    flexWrap: "wrap",
  },

  analyticsCard: {
    flex: 1,

    minWidth: "220px",

    background:
      "rgba(15,23,42,0.72)",

    color: "white",

    padding: "28px",

    borderRadius:
      "24px",

    backdropFilter:
      "blur(16px)",

    border:
      "1px solid rgba(255,255,255,0.06)",

    boxShadow:
      "0 0 30px rgba(0,0,0,0.25)",
  },

  taskCreator: {
    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",

    gap: "18px",

    marginBottom:
      "40px",
  },

  kanbanContainer: {
    display: "flex",

    gap: "24px",

    flexWrap: "wrap",
  },

  column: {
    flex: 1,

    minWidth: "320px",

    background:
      "rgba(15,23,42,0.75)",

    padding: "24px",

    borderRadius:
      "28px",

    minHeight: "520px",

    border:
      "1px solid rgba(255,255,255,0.06)",

    backdropFilter:
      "blur(18px)",

    boxShadow:
      "0 0 45px rgba(0,0,0,0.25)",
  },

  columnTitle: {
    color: "#ffffff",

    marginBottom:
      "24px",

    fontSize: "24px",

    fontWeight:
      "700",

    textAlign:
      "center",
  },

  taskCard: {
    background:
      "linear-gradient(135deg,#1e293b,#111827)",

    color: "white",

    padding: "20px",

    borderRadius:
      "20px",

    marginBottom:
      "18px",

    border:
      "1px solid rgba(255,255,255,0.05)",

    boxShadow:
      "0 8px 30px rgba(0,0,0,0.3)",
  },

  deleteBtn: {
    background:
      "rgba(239,68,68,0.12)",

    border: "none",

    color: "#fb7185",

    width: "32px",

    height: "32px",

    borderRadius:
      "10px",

    cursor: "pointer",

    fontSize: "16px",
  },
};

export default App;