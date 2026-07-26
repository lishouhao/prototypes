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
  tasks: ["评价任务", "手动创建评价周期，配置评价对象、维度、评分范围和参与人员类型。"],
  objects: ["评价对象", "维护物业公司和餐厅等被评价对象，支持启用、停用和历史保留。"],
  dimensions: ["评价维度", "配置物业和餐饮默认维度，新建任务时自动带入并允许调整。"],
  reports: ["统计报表", "查看各评价对象、各评价维度平均得分，并导出Excel数据。"]
};

const confirmCopy = {
  closeTask: ["关闭评价任务", "关闭后 APP 端不再允许提交评价，已提交数据仍保留在统计报表中。", "评价任务已关闭"],
  publishTask: ["发布评价任务", "发布后符合人员类型的用户将在 APP 端看到评价入口。", "评价任务已发布"],
  deleteDraft: ["删除草稿", "删除后该未发布任务不会进入 APP 端，也不会保留配置内容。", "草稿已删除"],
  disableObject: ["停用评价对象", "停用后新建任务不可再选择该对象，历史评价与报表不受影响。", "评价对象已停用"],
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
  drawerTitle.textContent = isView ? "查看评价任务" : mode === "edit" ? "编辑评价任务" : "新建评价任务";
  drawerDesc.textContent = isView ? "查看后台发布配置，已发布任务不可直接修改评分规则。" : "手动配置本次后台发布内容，APP 端按此规则展示。";
  drawer.querySelectorAll("input, select").forEach((field) => { field.disabled = isView; });
  drawer.querySelectorAll("[data-task-submit]").forEach((button) => { button.style.display = isView ? "none" : "inline-flex"; });
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
  const minScore = Number(document.getElementById("minScore").value);
  const maxScore = Number(document.getElementById("maxScore").value);
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  if (!document.getElementById("taskName").value.trim()) return "请输入任务名称";
  if (!startDate || !endDate || startDate > endDate) return "结束时间不能早于开始时间";
  if (!Number.isInteger(minScore) || !Number.isInteger(maxScore) || minScore >= maxScore) return "评分范围需为数字整数，且最高分必须大于最低分";
  return "";
}

function openFormModal(entity, mode, type) {
  const isObject = entity === "object";
  formModalTitle.textContent = `${mode === "create" ? "新增" : "编辑"}${isObject ? "评价对象" : "评价维度"}`;
  formModalBody.innerHTML = isObject ? `
    <div class="modal-form">
      <label>对象名称<input value="${mode === "edit" ? "明德物业" : ""}" placeholder="请输入对象名称"></label>
      <label>对象类型<select><option>物业</option><option>餐饮</option></select></label>
      <label>负责人<input value="${mode === "edit" ? "王老师" : ""}" placeholder="请输入负责人"></label>
      <label>启用状态<select><option>启用</option><option>停用</option></select></label>
    </div>
    <p class="help">对象停用后不影响历史评价结果和导出数据。</p>
  ` : `
    <div class="modal-form">
      <label>维度名称<input value="${mode === "edit" ? "服务态度" : ""}" placeholder="请输入维度名称"></label>
      <label>适用类型<select><option>${type || "物业"}</option><option>物业</option><option>餐饮</option></select></label>
      <label>排序<input type="number" value="1"></label>
      <label>启用状态<select><option>启用</option><option>停用</option></select></label>
    </div>
    <p class="help">维度为默认模板配置，新建评价任务时自动带入，任务内仍可调整。</p>
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

function openInfo(title, desc, message) {
  confirmTitle.textContent = title;
  confirmDesc.textContent = desc;
  pendingConfirmMessage = message;
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
  if (target.dataset.pageJump) switchPage(target.dataset.pageJump);
  if (target.dataset.taskMode) openDrawer(target.dataset.taskMode);
  if (target.dataset.submissions !== undefined) openSubmissions();
  if (target.dataset.entity) openFormModal(target.dataset.entity, target.dataset.mode, target.dataset.type);
  if (target.dataset.confirm) openConfirm(target.dataset.confirm);
  if (target.dataset.closeModal !== undefined) closeModals();

  if (target.dataset.action === "search") showToast("已按筛选条件刷新任务列表");
  if (target.dataset.action === "reset") showToast("筛选条件已重置");
  if (target.dataset.action === "refreshReport") showToast("统计报表已刷新");
  if (target.dataset.action === "export") showToast("已生成Excel导出任务");
  if (target.dataset.action === "filterSubmissions") showToast("已刷新本任务提交数据");
  if (target.dataset.action === "exportSubmissions") showToast("已生成本任务问卷明细导出文件");
  if (target.dataset.action === "remind") showToast("已发送提交提醒");
  if (target.dataset.action === "viewDetail") openInfo("查看评分明细", "展示该评价人各维度得分：服务态度4.5、环境卫生4.2、菜品质量4.0。", "已关闭明细");
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
    showToast(target.dataset.taskSubmit === "publish" ? "评价任务已发布" : "草稿已保存");
  }
});

createTaskBtn.addEventListener("click", () => openDrawer("create"));
closeDrawer.addEventListener("click", hideDrawer);
cancelDrawer.addEventListener("click", hideDrawer);
drawerMask.addEventListener("click", hideDrawer);
modalMask.addEventListener("click", closeModals);
