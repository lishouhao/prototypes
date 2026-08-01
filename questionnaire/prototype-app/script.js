const screens = document.querySelectorAll(".screen");
const pageTitle = document.getElementById("pageTitle");
const bottomBar = document.getElementById("bottomBar");
const submitBtn = document.getElementById("submitBtn");
const formObject = document.getElementById("formObject");
const successObject = document.getElementById("successObject");
const formError = document.getElementById("formError");
const formInstruction = document.getElementById("formInstruction");
const toast = document.getElementById("toast");
const scoreList = document.getElementById("scoreList");
const stateIcon = document.getElementById("stateIcon");
const stateTitle = document.getElementById("stateTitle");
const stateDesc = document.getElementById("stateDesc");

let currentScreen = "portal";
let historyStack = ["portal"];
let scoreMax = 10;
let currentTask = "canteen";
let scores = Array(5).fill(null);

const taskConfig = {
  property: {
    type: "问卷调查",
    name: "2026年7月物业服务调查问卷",
    scoreMax: 5,
    instruction: "请根据近期物业服务体验完成本问卷评分，各维度均需选择分值后提交。",
    textQuestions: [
      { enabled: true, position: "before", title: "请填写您最希望改善的一项物业服务", required: true },
      { enabled: true, position: "after", title: "请填写其他补充信息", required: false }
    ],
    objects: [
      { name: "明德物业", status: "todo", desc: "安保服务、保洁服务、会议服务等 5 项" },
      { name: "启新物业", status: "todo", desc: "安保服务、保洁服务、会议服务等 5 项" }
    ],
    dimensions: [{ name: "安保服务", min: 1, max: 5 }, { name: "保洁服务", min: 1, max: 5 }, { name: "会议服务", min: 1, max: 10 }, { name: "物业管理", min: 1, max: 5 }, { name: "服务态度", min: 1, max: 5 }]
  },
  canteen: {
    type: "问卷调查",
    name: "2026年7月餐厅服务调查问卷",
    scoreMax: 10,
    instruction: "请结合本月就餐体验完成评分，评分仅用于服务改进。",
    textQuestions: [
      { enabled: true, position: "before", title: "请填写您本次主要评价的就餐时段", required: true },
      { enabled: true, position: "after", title: "请填写您最希望餐厅改进的一项内容", required: false }
    ],
    objects: [
      { name: "一号餐厅", status: "todo", desc: "环境卫生、菜品质量、菜品口味等 5 项" },
      { name: "二号餐厅", status: "todo", desc: "环境卫生、菜品质量、菜品口味等 5 项" },
      { name: "咖啡吧", status: "done", desc: "已于 2026-07-20 10:08 提交" }
    ],
    dimensions: [{ name: "环境卫生", min: 1, max: 5 }, { name: "菜品质量", min: 1, max: 10 }, { name: "菜品口味", min: 1, max: 10 }, { name: "售价感知度", min: 1, max: 5 }, { name: "服务态度", min: 1, max: 5 }]
  }
};

const titles = {
  portal: "苏实 e站",
  home: "问卷调查",
  form: "填写问卷",
  state: "问卷状态",
  success: "提交成功"
};

const stateCopy = {
  submitted: ["✓", "已提交", "该问卷已完成提交。按照提交规则，同一评价人对同一任务下同一评价对象仅可提交一次，提交后不可修改。"],
  notStarted: ["!", "未到开始时间", "问卷尚未开放，请在开始时间后进入填写。未到开始时间时不展示提交入口。"],
  expired: ["!", "问卷已结束", "当前时间已超过任务结束时间，系统不允许继续填写或提交。"],
  empty: ["空", "暂无待填写问卷", "当前账号没有符合评价人范围且处于开放时间内的问卷任务。"]
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
  if (currentScreen === "portal") {
    showToast("已在首页");
    return;
  }
  historyStack.pop();
  switchScreen(historyStack[historyStack.length - 1] || "portal", false);
}

function renderScoreOptions() {
  document.querySelectorAll("[data-score-item]").forEach((item, index) => {
    const options = item.querySelector(".score-options");
    options.innerHTML = "";
    const dimension = taskConfig[currentTask].dimensions[index];
    const values = Array.from({ length: dimension.max - dimension.min + 1 }, (_, i) => dimension.min + i);
    values.forEach((value) => {
      const button = document.createElement("button");
      button.textContent = value;
      button.className = scores[index] === value ? "active" : "";
      button.addEventListener("click", () => {
        scores[index] = value;
        document.getElementById(`scoreLabel${index}`).textContent = `已选 ${value} 分`;
        renderScoreOptions();
      });
      options.appendChild(button);
    });
  });
}

function renderTextQuestion(question, index) {
  if (!question?.enabled || !question.title) return "";
  return `
    <div class="text-question" data-text-question data-required="${question.required ? "true" : "false"}">
      <label for="extraTextAnswer${index}">${question.title}${question.required ? "<span>必填</span>" : ""}</label>
      <input id="extraTextAnswer${index}" type="text" maxlength="100" placeholder="请输入" />
    </div>
  `;
}

function renderDimensions() {
  const config = taskConfig[currentTask];
  const textQuestions = (config.textQuestions || []).filter((question) => question.enabled && question.title);
  const beforeQuestions = textQuestions.filter((question) => question.position === "before");
  const afterQuestions = textQuestions.filter((question) => question.position === "after");
  const dimensionHtml = config.dimensions.map((dimension, index) => `
    <div class="score-item" data-score-item>
      <div><strong>${dimension.name}</strong><span id="scoreLabel${index}">${dimension.min}-${dimension.max} 分</span></div>
      <div class="score-options"></div>
    </div>
  `).join("");
  scoreList.innerHTML = [
    ...beforeQuestions.map(renderTextQuestion),
    dimensionHtml,
    ...afterQuestions.map(renderTextQuestion)
  ].join("");
}

function openTask(task, objectName, status = "todo") {
  currentTask = task;
  const config = taskConfig[currentTask];
  scoreMax = config.scoreMax;
  if (status === "done") {
    openState("submitted");
    return;
  }
  openForm(objectName || config.objects[0]?.name);
}

function openState(type) {
  const copy = stateCopy[type] || stateCopy.expired;
  stateIcon.textContent = copy[0];
  stateTitle.textContent = copy[1];
  stateDesc.textContent = copy[2];
  switchScreen("state");
}

function openForm(objectName) {
  formObject.textContent = taskConfig[currentTask].name;
  successObject.textContent = objectName;
  formInstruction.textContent = taskConfig[currentTask].instruction || "";
  formInstruction.hidden = !taskConfig[currentTask].instruction;
  scores = Array(taskConfig[currentTask].dimensions.length).fill(null);
  renderDimensions();
  formError.textContent = "";
  renderScoreOptions();
  switchScreen("form");
}

function submitForm() {
  const missingTextQuestion = [...document.querySelectorAll("[data-text-question][data-required='true'] input")].some((input) => !input.value.trim());
  if (missingTextQuestion) {
    formError.textContent = "请填写必填文本问题后再提交";
    return;
  }
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
  if (target.dataset.task) openTask(target.dataset.task, target.dataset.object, target.dataset.status);
  if (target.dataset.state) openState(target.dataset.state);
  if (target.dataset.page && !target.dataset.task) switchScreen(target.dataset.page);
  if (target.dataset.action === "placeholder") showToast("功能建设中");
});

submitBtn.addEventListener("click", submitForm);
renderScoreOptions();
