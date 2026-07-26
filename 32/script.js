const screens = document.querySelectorAll(".screen");
const pageTitle = document.getElementById("pageTitle");
const bottomBar = document.getElementById("bottomBar");
const submitBtn = document.getElementById("submitBtn");
const formObject = document.getElementById("formObject");
const successObject = document.getElementById("successObject");
const formError = document.getElementById("formError");
const toast = document.getElementById("toast");
const objectList = document.getElementById("objectList");
const scoreList = document.getElementById("scoreList");

let currentScreen = "home";
let historyStack = ["home"];
let scoreMax = 10;
let currentTask = "canteen";
let scores = Array(5).fill(null);

const taskConfig = {
  property: {
    type: "物业评价",
    name: "2026年7月物业服务评价",
    scoreMax: 5,
    objects: [
      { name: "明德物业", status: "todo", desc: "安保服务、保洁服务、会议服务等 5 项" },
      { name: "启新物业", status: "done", desc: "已于 2026-07-20 10:08 提交" }
    ],
    dimensions: ["安保服务", "保洁服务", "会议服务", "物业管理", "服务态度"]
  },
  canteen: {
    type: "餐饮评价",
    name: "2026年7月餐厅服务评价",
    scoreMax: 10,
    objects: [
      { name: "一号餐厅", status: "todo", desc: "环境卫生、菜品质量、菜品口味等 5 项" },
      { name: "二号餐厅", status: "done", desc: "已于 2026-07-20 10:08 提交" },
      { name: "咖啡吧", status: "todo", desc: "环境卫生、菜品质量、菜品口味等 5 项" }
    ],
    dimensions: ["环境卫生", "菜品质量", "菜品口味", "售价感知度", "服务态度"]
  }
};

const titles = {
  home: "服务评价",
  objects: "选择评价对象",
  form: "填写评价",
  success: "提交成功",
  records: "我的评价记录",
  detail: "评价详情"
};

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("open");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("open"), 1600);
}

function switchScreen(name, push = true) {
  screens.forEach((screen) => screen.classList.remove("active"));
  document.getElementById(`${name}Screen`).classList.add("active");
  pageTitle.textContent = titles[name];
  bottomBar.classList.toggle("show", name === "form");
  currentScreen = name;
  if (push && historyStack[historyStack.length - 1] !== name) historyStack.push(name);
}

function goBack() {
  if (currentScreen === "home") {
    showToast("已在首页");
    return;
  }
  historyStack.pop();
  switchScreen(historyStack[historyStack.length - 1] || "home", false);
}

function renderScoreOptions() {
  document.querySelectorAll("[data-score-item]").forEach((item, index) => {
    const options = item.querySelector(".score-options");
    options.innerHTML = "";
    const values = Array.from({ length: scoreMax }, (_, i) => i + 1);
    values.forEach((value) => {
      const button = document.createElement("button");
      button.textContent = value;
      button.className = scores[index] === value ? "active" : "";
      button.addEventListener("click", () => {
        scores[index] = value;
        document.getElementById(`scoreLabel${index}`).textContent = `${value}分`;
        renderScoreOptions();
      });
      options.appendChild(button);
    });
  });
}

function renderObjects() {
  const config = taskConfig[currentTask];
  objectList.innerHTML = config.objects.map((object) => `
    <button class="task-row object-row" data-object="${object.name}" data-status="${object.status}">
      <div>
        <strong>${object.name}</strong>
        <p>${object.desc}</p>
      </div>
      <span class="tag ${object.status === "done" ? "done" : "running"}">${object.status === "done" ? "已提交" : "待评价"}</span>
    </button>
  `).join("");
}

function renderDimensions() {
  scoreList.innerHTML = taskConfig[currentTask].dimensions.map((dimension, index) => `
    <div class="score-item" data-score-item>
      <div><strong>${dimension}</strong><span id="scoreLabel${index}">未评分</span></div>
      <div class="score-options"></div>
    </div>
  `).join("");
}

function openTask(task) {
  currentTask = task;
  const config = taskConfig[currentTask];
  document.getElementById("taskType").textContent = config.type;
  document.getElementById("taskName").textContent = config.name;
  document.getElementById("objectCount").textContent = `${config.objects.length} 个对象`;
  scoreMax = config.scoreMax;
  renderObjects();
  switchScreen("objects");
}

function openForm(objectName) {
  formObject.textContent = objectName;
  successObject.textContent = objectName;
  document.getElementById("scoreRange").textContent = `1-${scoreMax}分`;
  document.getElementById("formTask").textContent = taskConfig[currentTask].type;
  scores = Array(5).fill(null);
  renderDimensions();
  formError.textContent = "";
  renderScoreOptions();
  switchScreen("form");
}

function submitForm() {
  const missingIndex = scores.findIndex((score) => score === null);
  if (missingIndex >= 0) {
    formError.textContent = "请完成所有评价维度评分后再提交";
    return;
  }
  formError.textContent = "";
  switchScreen("success");
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("button");
  if (!target) return;
  if (target.dataset.back !== undefined) goBack();
  if (target.dataset.task) openTask(target.dataset.task);
  if (target.dataset.page && !target.dataset.task) switchScreen(target.dataset.page);
  if (target.dataset.object) {
    if (target.dataset.status === "done") {
      showToast("该对象已提交，不能重复评价");
      switchScreen("detail");
      return;
    }
    openForm(target.dataset.object);
  }
});

submitBtn.addEventListener("click", submitForm);
renderScoreOptions();
