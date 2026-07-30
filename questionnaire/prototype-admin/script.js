const navItems = document.querySelectorAll(".menu-item");
const pages = document.querySelectorAll(".page");
const pageTitle = document.getElementById("pageTitle");
const pageDesc = document.getElementById("pageDesc");
const createTaskBtn = document.getElementById("createTaskBtn");
const drawer = document.getElementById("taskDrawer");
const drawerMask = document.getElementById("drawerMask");
const drawerTitle = document.getElementById("drawerTitle");
const drawerDesc = document.getElementById("drawerDesc");
const closeDrawer = document.getElementById("closeDrawer");
const cancelDrawer = document.getElementById("cancelDrawer");
const taskError = document.getElementById("taskError");
const modalMask = document.getElementById("modalMask");
const formModal = document.getElementById("formModal");
const formModalTitle = document.getElementById("formModalTitle");
const formModalBody = document.getElementById("formModalBody");
const confirmModal = document.getElementById("confirmModal");
const submissionsModal = document.getElementById("submissionsModal");
const confirmTitle = document.getElementById("confirmTitle");
const confirmDesc = document.getElementById("confirmDesc");
const toast = document.getElementById("toast");
let pendingConfirmMessage = "操作成功";

const pageMeta = {
  tasks: ["问卷任务", "配置问卷对象、评价维度、开放周期和评价人范围。"],
  dimensions: ["评价维度", "统一维护默认评价维度，新建问卷任务时自动带入。"]
};

const confirmCopy = {
  closeTask: ["结束问卷任务", "结束后用户不可继续提交，已提交数据保留。", "问卷任务已结束"],
  publishTask: ["发布问卷任务", "发布后符合范围的用户将在移动端看到问卷入口。", "问卷任务已发布"],
  deleteDraft: ["删除草稿", "删除后该未发布任务不会进入移动端，也不会保留配置内容。", "草稿已删除"],
  copyTask: ["复制问卷任务", "复制后生成一条未发布任务，可继续调整开放时间、评价对象和维度。", "问卷任务已复制"],
  disableDimension: ["停用评价维度", "停用后新建任务默认不再带入该维度，历史数据不受影响。", "评价维度已停用"]
};

function switchPage(pageName) {
  navItems.forEach((item) => item.classList.toggle("active", item.dataset.page === pageName));
  pages.forEach((page) => page.classList.remove("page-active"));
  document.getElementById(`${pageName}Page`).classList.add("page-active");
  pageTitle.textContent = pageMeta[pageName][0];
  pageDesc.textContent = pageMeta[pageName][1];
  createTaskBtn.style.display = pageName === "tasks" ? "inline-flex" : "none";
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("open");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("open"), 1800);
}

function openDrawer(mode = "create") {
  const isView = mode === "view";
  drawerTitle.textContent = isView ? "查看问卷任务" : mode === "edit" ? "编辑问卷任务" : "新建问卷任务";
  drawerDesc.textContent = isView ? "已发布任务仅可查看。" : "配置问卷任务。";
  drawer.querySelectorAll("input, select, textarea").forEach((field) => { field.disabled = isView; });
  drawer.querySelectorAll("[data-task-submit]").forEach((button) => { button.style.display = isView ? "none" : "inline-flex"; });
  drawer.querySelectorAll(".chip-add").forEach((button) => { button.style.display = isView ? "none" : "inline-flex"; });
  taskError.textContent = "";
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
  drawerMask.classList.add("open");
}

function hideDrawer() {
  drawer.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
  drawerMask.classList.remove("open");
}

function validateTask() {
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  const instruction = document.getElementById("taskInstruction").value.trim();
  const extraQuestionRows = [...drawer.querySelectorAll("[data-extra-question]")];
  const checkedObjects = drawer.querySelectorAll("[data-object-options] input[type='checkbox']:checked").length;
  const checkedScopes = drawer.querySelectorAll("[data-user-scope] input[type='checkbox']:checked").length;
  const dimensionRows = [...drawer.querySelectorAll(".dimension-rule")];
  if (!document.getElementById("taskName").value.trim()) return "请输入任务名称";
  if (!startDate || !endDate || startDate > endDate) return "结束时间不能早于开始时间";
  if (instruction.length > 300) return "填写说明不能超过 300 字";
  const invalidExtraQuestion = extraQuestionRows.some((row) => row.querySelector("[data-extra-enabled]").checked && !row.querySelector("[data-extra-title]").value.trim());
  if (invalidExtraQuestion) return "请输入已启用的附加文本问题标题";
  if (checkedObjects === 0) return "请至少选择一个评价对象";
  if (dimensionRows.length === 0) return "请至少保留一个评价维度";
  if (checkedScopes === 0) return "请选择评价人范围";
  const invalidDimension = dimensionRows.some((row) => {
    const inputs = row.querySelectorAll("input[type='number']");
    const minScore = Number(inputs[0].value);
    const maxScore = Number(inputs[1].value);
    return !Number.isInteger(minScore) || !Number.isInteger(maxScore) || minScore >= maxScore;
  });
  if (invalidDimension) return "每个维度的分值需为整数，且最高分必须大于最低分";
  return "";
}

function openFormModal(entity, mode) {
  formModalTitle.textContent = `${mode === "create" ? "新增" : "编辑"}评价维度`;
  formModalBody.innerHTML = `
    <div class="modal-form">
      <label>维度名称<input value="${mode === "edit" ? "服务态度" : ""}" placeholder="请输入维度名称"></label>
      <label>排序<input type="number" value="1"></label>
      <label>启用状态<select><option>启用</option><option>停用</option></select></label>
    </div>
    <p class="help">新建问卷任务默认带入，可在任务内调整。</p>
  `;
  modalMask.classList.add("open");
  formModal.classList.add("open");
  formModal.setAttribute("aria-hidden", "false");
}
function openConfirm(type) {
  const copy = confirmCopy[type];
  confirmTitle.textContent = copy[0];
  confirmDesc.textContent = copy[1];
  pendingConfirmMessage = copy[2];
  modalMask.classList.add("open");
  confirmModal.classList.add("open");
  confirmModal.setAttribute("aria-hidden", "false");
}

function closeModals() {
  modalMask.classList.remove("open");
  formModal.classList.remove("open");
  confirmModal.classList.remove("open");
  submissionsModal.classList.remove("open");
  formModal.setAttribute("aria-hidden", "true");
  confirmModal.setAttribute("aria-hidden", "true");
  submissionsModal.setAttribute("aria-hidden", "true");
}

function openSubmissions() {
  modalMask.classList.add("open");
  submissionsModal.classList.add("open");
  submissionsModal.setAttribute("aria-hidden", "false");
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("button");
  if (!target) return;
  if (target.dataset.page) switchPage(target.dataset.page);
  if (target.dataset.taskMode) openDrawer(target.dataset.taskMode);
  if (target.dataset.submissions !== undefined) openSubmissions();
  if (target.dataset.entity) openFormModal(target.dataset.entity, target.dataset.mode);
  if (target.dataset.confirm) openConfirm(target.dataset.confirm);
  if (target.dataset.closeModal !== undefined) closeModals();

  if (target.dataset.toggleState) {
    const isOn = target.dataset.toggleState === "on";
    target.dataset.toggleState = isOn ? "off" : "on";
    target.classList.toggle("on", !isOn);
    target.classList.toggle("off", isOn);
    target.textContent = isOn ? "停用" : "启用";
    const rowStatus = target.closest("tr")?.querySelector(".tag");
    if (rowStatus) {
      rowStatus.textContent = isOn ? "停用" : "启用";
      rowStatus.classList.toggle("running", !isOn);
      rowStatus.classList.toggle("ended", isOn);
    }
    const editButton = target.closest(".item")?.querySelector("button.link");
    if (editButton) editButton.disabled = !isOn;
    showToast(isOn ? "已停用" : "已启用");
    return;
  }

  if (target.dataset.action === "search") showToast("已按筛选条件刷新任务列表");
  if (target.dataset.action === "reset") showToast("筛选条件已重置");
  if (target.dataset.action === "filterSubmissions") showToast("已刷新本任务提交明细");
  if (target.dataset.action === "exportSubmissions") showToast("已生成本任务提交明细导出文件");
  if (target.dataset.action === "prevPage" || target.dataset.action === "nextPage") showToast("已切换分页数据");

  if (target.dataset.saveForm !== undefined) {
    closeModals();
    showToast("配置已保存");
  }

  if (target.dataset.confirmOk !== undefined) {
    closeModals();
    showToast(pendingConfirmMessage);
  }

  if (target.dataset.taskSubmit) {
    const error = validateTask();
    if (error) {
      taskError.textContent = error;
      return;
    }
    hideDrawer();
    showToast(target.dataset.taskSubmit === "publish" ? "问卷任务已发布" : "草稿已保存");
  }
});

createTaskBtn.addEventListener("click", () => openDrawer("create"));
closeDrawer.addEventListener("click", hideDrawer);
cancelDrawer.addEventListener("click", hideDrawer);
drawerMask.addEventListener("click", hideDrawer);
modalMask.addEventListener("click", closeModals);







