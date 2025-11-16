const API_BASE = "http://localhost:8000/uploads";
const uploadsGrid = document.getElementById("uploadsGrid");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const editModal = document.getElementById("editModal");
const detailModal = document.getElementById("detailModal");
const editForm = document.getElementById("editForm");
const fileUpload = document.getElementById("fileUpload");
const filePreview = document.getElementById("filePreview");
const modalTitle = document.getElementById("modalTitle");
const submitBtn = document.getElementById("submitBtn");

let uploads = [];
let uploadedFiles = [];
let currentEditId = null;
const USER_ID = "11111111-1111-1111-1111-111111111111";

const statusClassMap = {
  "Đã gửi": "submitted",
  "Đã duyệt": "approved",
  "Từ chối": "rejected"
};

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.style.background =
    type === "error" ? "#e53e3e" :
    type === "success" ? "#38a169" :
    type === "warning" ? "#dd6b20" :
    "#2d3748";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function formatDate(dateString) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatCurrency(amount) {
  if (!amount) return "—";
  return parseFloat(amount).toLocaleString("vi-VN") + "₫";
}

async function fetchUploads() {
  try {
    const res = await fetch(`${API_BASE}/?created_by=${USER_ID}`);
    if (!res.ok) throw new Error("Không thể tải dữ liệu");
    uploads = await res.json();
    renderGrid(uploads);
  } catch (err) {
    console.error("Fetch error:", err);
    showToast("Không thể tải danh sách phiếu!", "error");
    uploadsGrid.innerHTML = `
      <div class="empty-state">
        <h3>❌ Không thể kết nối server</h3>
        <p>Vui lòng thử lại sau</p>
      </div>
    `;
  }
}

function renderGrid(data) {
  if (!data || data.length === 0) {
    uploadsGrid.innerHTML = `
      <div class="empty-state">
        <h3>📋 Chưa có phiếu bảo hành nào</h3>
        <p>Nhấn "Tạo phiếu mới" để bắt đầu</p>
      </div>
    `;
    return;
  }

  uploadsGrid.innerHTML = "";
  data.forEach(upload => {
    const statusValue = typeof upload.status === 'object' ? upload.status.value : upload.status;
    const statusClass = statusClassMap[statusValue] || "submitted";
    
    const card = document.createElement("div");
    card.className = "upload-card";

    // Show different buttons based on status
    let actionButtons = '';
    if (statusValue === "Đã gửi") {
      // Can edit, delete, or submit
      actionButtons = `
        <button class="btn-submit" onclick="submitUpload(${upload.id})">📤 Gửi duyệt</button>
        <button class="btn-edit" onclick="openEditModal(${upload.id})">✏️ Sửa</button>
        <button class="btn-delete" onclick="deleteUpload(${upload.id})">🗑️ Xóa</button>
      `;
    } else {
      // Can only view details (approved or rejected)
      actionButtons = `
        <button class="btn-view" onclick="viewDetail(${upload.id})">👁️ Chi tiết</button>
      `;
    }
    
    card.innerHTML = `
      <div class="card-header">
        <div class="card-id">#${upload.id}</div>
        <span class="status-badge ${statusClass}">${statusValue}</span>
      </div>
      
      <div class="card-body">
        <div class="card-vin">🚗 ${upload.vin}</div>
        <div class="card-customer">👤 ${upload.customer_name || "Chưa có thông tin"}</div>
        <div class="card-description">${upload.description || "Không có mô tả"}</div>
      </div>
      
      <div class="card-footer">
        <div class="card-cost">${formatCurrency(upload.warranty_cost)}</div>
        <div class="card-date">${formatDate(upload.created_at)}</div>
      </div>
      
      <div class="card-actions">
        ${actionButtons}
      </div>
    `;
    
    uploadsGrid.appendChild(card);
  });
}

// Open modal for create
function openCreateModal() {
  currentEditId = null;
  modalTitle.textContent = "Tạo phiếu bảo hành mới";
  submitBtn.textContent = "Tạo phiếu";
  editModal.classList.add("active");
  editForm.reset();
  uploadedFiles = [];
  filePreview.innerHTML = "";
}

// Open modal for edit
async function openEditModal(id) {
  currentEditId = id;
  modalTitle.textContent = "Chỉnh sửa phiếu bảo hành";
  submitBtn.textContent = "Lưu thay đổi";
  
  try {
    const res = await fetch(`${API_BASE}/${id}`);
    if (!res.ok) throw new Error("Không thể tải thông tin phiếu");
    
    const upload = await res.json();
    
    // Check if can edit (must be "Đã gửi")
    const statusValue = typeof upload.status === 'object' ? upload.status.value : upload.status;
    if (statusValue !== "Đã gửi") {
      showToast("Chỉ có thể sửa phiếu ở trạng thái 'Đã gửi'", "error");
      return;
    }
    
    document.getElementById("vin").value = upload.vin || "";
    document.getElementById("customerName").value = upload.customer_name || "";
    document.getElementById("description").value = upload.description || "";
    document.getElementById("diagnosis").value = upload.diagnosis || "";
    document.getElementById("warrantyCost").value = upload.warranty_cost || "";
    
    uploadedFiles = upload.file_url ? [{ url: upload.file_url, name: "File hiện tại" }] : [];
    if (uploadedFiles.length > 0) {
      filePreview.innerHTML = `<div class="file-item">📎 ${uploadedFiles[0].name}</div>`;
    }
    
    editModal.classList.add("active");
  } catch (err) {
    console.error("Error loading upload:", err);
    showToast("Không thể tải thông tin phiếu!", "error");
  }
}

function closeEditModal() {
  editModal.classList.remove("active");
  editForm.reset();
  uploadedFiles = [];
  filePreview.innerHTML = "";
  currentEditId = null;
}

// Handle file upload
fileUpload.addEventListener("change", async (e) => {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;

  filePreview.innerHTML = "<p>⏳ Đang tải file...</p>";
  
  try {
    const formData = new FormData();
    files.forEach(file => formData.append("files", file));
    
    const res = await fetch(`${API_BASE}/files`, {
      method: "POST",
      body: formData
    });
    
    if (!res.ok) throw new Error("Upload file thất bại");
    
    const result = await res.json();
    uploadedFiles = result.files;
    
    filePreview.innerHTML = "";
    uploadedFiles.forEach(file => {
      const item = document.createElement("div");
      item.className = "file-item";
      item.innerHTML = `📎 ${file.name}`;
      filePreview.appendChild(item);
    });
    
    showToast(`✅ Đã tải lên ${uploadedFiles.length} file`, "success");
  } catch (err) {
    console.error("File upload error:", err);
    showToast("Lỗi khi tải file lên!", "error");
    filePreview.innerHTML = "";
  }
});

// Submit form (create or edit)
async function submitForm(event) {
  event.preventDefault();
  
  const data = {
    vin: document.getElementById("vin").value.trim(),
    customer_name: document.getElementById("customerName").value.trim() || null,
    description: document.getElementById("description").value.trim(),
    diagnosis: document.getElementById("diagnosis").value.trim() || null,
    warranty_cost: parseFloat(document.getElementById("warrantyCost").value) || null,
    file_url: uploadedFiles.length > 0 ? uploadedFiles[0].url : null
  };
  
  try {
    let res;
    if (currentEditId) {
      // Update existing
      res = await fetch(`${API_BASE}/${currentEditId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      
      if (res.ok) {
        showToast(`✅ Đã cập nhật phiếu #${currentEditId}`, "success");
      }
    } else {
      // Create new
      res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      
      if (res.ok) {
        const result = await res.json();
        showToast(`✅ Đã tạo phiếu #${result.upload_id}`, "success");
      }
    }
    
    if (!res.ok) throw new Error("Thao tác thất bại");
    
    closeEditModal();
    await fetchUploads();
  } catch (err) {
    console.error("Submit error:", err);
    showToast("Không thể lưu phiếu!", "error");
  }
}

// Submit upload for approval
async function submitUpload(id) {
  if (!confirm(`Xác nhận gửi phiếu #${id} lên admin duyệt?`)) return;
  
  const button = event.target;
  button.disabled = true;
  button.textContent = "⏳ Đang gửi...";
  
  try {
    const res = await fetch(`${API_BASE}/${id}/submit`, {
      method: "PUT"
    });
    
    if (!res.ok) throw new Error("Gửi phiếu thất bại");
    
    showToast(`✅ Đã gửi phiếu #${id} lên admin!`, "success");
    await fetchUploads();
  } catch (err) {
    console.error("Submit error:", err);
    showToast("Không thể gửi phiếu!", "error");
    button.disabled = false;
    button.textContent = "📤 Gửi duyệt";
  }
}

// Delete upload
async function deleteUpload(id) {
  if (!confirm(`Bạn chắc chắn muốn xóa phiếu #${id}?`)) return;
  
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE"
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || "Xóa thất bại");
    }
    
    showToast(`✅ Đã xóa phiếu #${id}`, "success");
    await fetchUploads();
  } catch (err) {
    console.error("Delete error:", err);
    showToast(err.message || "Không thể xóa phiếu!", "error");
  }
}

// View detail
async function viewDetail(id) {
  const upload = uploads.find(u => u.id === id);
  if (!upload) return;
  
  const statusValue = typeof upload.status === 'object' ? upload.status.value : upload.status;
  const statusClass = statusClassMap[statusValue] || "submitted";
  
  const detailContent = document.getElementById("detailContent");
  detailContent.innerHTML = `
    <div class="detail-row">
      <div class="detail-label">Mã phiếu</div>
      <div class="detail-value"><strong>#${upload.id}</strong></div>
    </div>
    
    <div class="detail-row">
      <div class="detail-label">Trạng thái</div>
      <div class="detail-value">
        <span class="status-badge ${statusClass}">${statusValue}</span>
      </div>
    </div>
    
    <div class="detail-row">
      <div class="detail-label">Mã VIN xe</div>
      <div class="detail-value"><strong>${upload.vin}</strong></div>
    </div>
    
    <div class="detail-row">
      <div class="detail-label">Tên khách hàng</div>
      <div class="detail-value">${upload.customer_name || "—"}</div>
    </div>
    
    <div class="detail-row">
      <div class="detail-label">Mô tả vấn đề</div>
      <div class="detail-value">${upload.description || "—"}</div>
    </div>
    
    <div class="detail-row">
      <div class="detail-label">Chẩn đoán kỹ thuật</div>
      <div class="detail-value">${upload.diagnosis || "—"}</div>
    </div>
    
    <div class="detail-row">
      <div class="detail-label">Chi phí bảo hành</div>
      <div class="detail-value"><strong style="color: #667eea;">${formatCurrency(upload.warranty_cost)}</strong></div>
    </div>
    
    ${upload.file_url ? `
      <div class="detail-row">
        <div class="detail-label">Tệp đính kèm</div>
        <div class="detail-value">
          <a href="${upload.file_url}" target="_blank" style="color: #667eea;">📎 Xem file</a>
        </div>
      </div>
    ` : ""}
    
    ${upload.reject_reason ? `
      <div class="detail-row">
        <div class="detail-label">Lý do từ chối</div>
        <div class="detail-value" style="color: #e53e3e;">
          <strong>${upload.reject_reason}</strong>
        </div>
      </div>
    ` : ""}
    
    <div class="detail-row">
      <div class="detail-label">Ngày tạo</div>
      <div class="detail-value">${formatDate(upload.created_at)}</div>
    </div>
    
    ${upload.approved_by ? `
      <div class="detail-row">
        <div class="detail-label">Người duyệt</div>
        <div class="detail-value">${upload.approved_by}</div>
      </div>
    ` : ""}
  `;
  
  detailModal.classList.add("active");
}

function closeDetailModal() {
  detailModal.classList.remove("active");
}

// Filter & Search
function filterUploads() {
  const search = searchInput.value.toLowerCase().trim();
  const status = statusFilter.value;
  
  const filtered = uploads.filter(upload => {
    const statusValue = typeof upload.status === 'object' ? upload.status.value : upload.status;
    
    const matchSearch = !search ||
      upload.vin.toLowerCase().includes(search) ||
      (upload.customer_name || "").toLowerCase().includes(search) ||
      (upload.description || "").toLowerCase().includes(search) ||
      upload.id.toString().includes(search);
    
    const matchStatus = status === "all" || statusValue === status;
    
    return matchSearch && matchStatus;
  });
  
  renderGrid(filtered);
}

searchInput.addEventListener("input", filterUploads);
statusFilter.addEventListener("change", filterUploads);

editModal.addEventListener("click", (e) => {
  if (e.target === editModal) closeEditModal();
});

detailModal.addEventListener("click", (e) => {
  if (e.target === detailModal) closeDetailModal();
});

document.addEventListener("DOMContentLoaded", () => {
  uploadsGrid.innerHTML = `
    <div class="loading">
      <h3>⏳ Đang tải dữ liệu...</h3>
    </div>
  `;
  fetchUploads();
});