const API = "https://task-manager-bcko.onrender.com";


let currentFilter = "all";

function setFilter(filter) {
  currentFilter = filter;
  loadTasks();
}

async function loadTasks() {
  const res = await fetch(`${API}/tasks`);
  const data = await res.json();

  const list = document.getElementById("taskList");
  list.innerHTML = "";

  data.forEach(task => {

  if (currentFilter === "completed" && !task.completed) return;
  if (currentFilter === "pending" && task.completed) return;
    const div = document.createElement("div");

    // ✅ SAFE priority handling
    const priority = task.priority ? task.priority.toLowerCase() : "low";
    div.className = `task ${priority}`;

    // ✅ completed styling
    if (task.completed === true) {
      div.style.opacity = "0.5";
      div.style.textDecoration = "line-through";
    }

    div.innerHTML = `
      <span>${task.title}</span>
      <div>
        <button onclick="completeTask(${task.id})" ${task.completed ? "disabled" : ""}>✔</button>
        <button onclick="deleteTask(${task.id})">❌</button>
      </div>
    `;

    list.appendChild(div);
  });
}

async function addTask() {
  const title = document.getElementById("taskInput").value;
  const priority = document.getElementById("priority").value;

  // ✅ prevent empty tasks
  if (!title.trim()) return;

  await fetch(`${API}/tasks`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ title, priority })
  });

  document.getElementById("taskInput").value = "";
  loadTasks();
}

async function completeTask(id) {
  await fetch(`${API}/tasks/${id}`, { method: "PUT" });
  loadTasks();
}

async function deleteTask(id) {
  await fetch(`${API}/tasks/${id}`, { method: "DELETE" });
  loadTasks();
}

loadTasks();

function startListening() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-US";

  recognition.start();

  recognition.onresult = function(event) {
    const command = event.results[0][0].transcript.toLowerCase();
    document.getElementById("voiceOutput").innerText = "You said: " + command;

    handleCommand(command);
  };
}

function handleCommand(command) {

  if (command.includes("high priority")) {
    alert("Showing high priority tasks");
    filterByPriority("high");
  }

  else if (command.includes("pending")) {
    setFilter("pending");
    speak("Showing pending tasks");
  }

  else if (command.includes("completed")) {
    setFilter("completed");
    speak("Showing completed tasks");
  }

  else if (command.includes("how many")) {
    countTasks();
  }

  else {
    speak("Sorry, I did not understand");
  }
}

function speak(text) {
  const speech = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(speech);
}

async function countTasks() {
  const res = await fetch(`${API}/tasks`);
  const data = await res.json();

  const pending = data.filter(t => !t.completed).length;

  speak(`You have ${pending} pending tasks`);
}

function filterByPriority(level) {
  currentFilter = "all";

  const list = document.getElementById("taskList");
  const tasks = list.children;

  for (let task of tasks) {
    if (!task.classList.contains(level)) {
      task.style.display = "none";
    } else {
      task.style.display = "flex";
    }
  }
}

