const API_BASE = "http://localhost:8000/claims";
const tableBody = document.getElementById("claimTableBody");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");

let claims = [];
let currentEditId = null;

const statusClassMap = {
  "Chờ duyệt": "pending",
  "Đã duyệt": "approved",
  "Từ chối": "rejected"
};

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.style.background =
    type === "error" ? "#e53e3e" :
    type === "success" ? "#38a169" :
    "#2d3748";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

async function fetchClaims() {
  try {
    const res = await fetch(`${API_BASE}/?role=admin&user_id=11`);
    if (!res.ok) throw new Error("Không thể tải dữ liệu");
    claims = await res.json();
    renderTable(claims);
  } catch (err) {
    console.error("Fetch error:", err);
    showToast("Không thể tải danh sách phiếu!", "error");
    tableBody.innerHTML = `<tr><td colspan="7" class="empty-state">❌ Không thể kết nối đến server</td></tr>`;
  }
}

function renderTable(data) {
  if (!data || data.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-state">
          <h3>Không có phiếu bảo hành nào</h3>
          <p>Danh sách phiếu bảo hành trống</p>
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = "";
  data.forEach(c => {
    const row = document.createElement("tr");
  
    const statusValue = typeof c.status === 'object' ? c.status.value : c.status;
    const statusClass = statusClassMap[statusValue] || "pending";
    
    const costDisplay = c.warranty_cost 
      ? parseFloat(c.warranty_cost).toLocaleString("vi-VN") 
      : "—";
    
    let actionButtons = '';
    if (statusValue === "Chờ duyệt") {
      actionButtons = `
        <div class="action-buttons">
          <button class="btn-edit" onclick="openEditModal(${c.id})">✏️ Sửa</button>
          <button class="btn-approve" onclick="approveClaim(${c.id})">✓ Duyệt</button>
          <button class="btn-reject" onclick="rejectClaim(${c.id})">✗ Từ chối</button>
        </div>
      `;
    } else {
      actionButtons = `
        <div class="action-buttons">
          <button class="btn-edit" onclick="openEditModal(${c.id})">✏️ Sửa</button>
        </div>
      `;
    }

    row.innerHTML = `
      <td><strong>#${c.id}</strong></td>
      <td>${c.vehicle_vin}</td>
      <td>${c.issue_desc || "—"}</td>
      <td>${costDisplay}₫</td>
      <td><span class="status-badge ${statusClass}">${statusValue}</span></td>
      <td>${c.created_by || "—"}</td>
      <td>${actionButtons}</td>
    `;
    tableBody.appendChild(row);
  });
}

async function openEditModal(id) {
  currentEditId = id;
  
  try {
    const res = await fetch(`${API_BASE}/${id}`);
    if (!res.ok) throw new Error("Không thể tải thông tin phiếu");
    
    const claim = await res.json();
    
    document.getElementById("editVin").value = claim.vehicle_vin || "";
    document.getElementById("editPartSerial").value = claim.part_serial || "";
    document.getElementById("editIssueDesc").value = claim.issue_desc || "";
    document.getElementById("editDiagnosis").value = claim.diagnosis_report || "";
    document.getElementById("editCost").value = claim.warranty_cost || "";
    
    editModal.classList.add("active");
  } catch (err) {
    console.error("Error loading claim:", err);
    showToast("Không thể tải thông tin phiếu!", "error");
  }
}

function closeEditModal() {
  editModal.classList.remove("active");
  editForm.reset();
  currentEditId = null;
}

async function submitEdit(event) {
  event.preventDefault();
  
  if (!currentEditId) return;
  
  const data = {
    vehicle_vin: document.getElementById("editVin").value.trim(),
    part_serial: document.getElementById("editPartSerial").value.trim() || null,
    issue_desc: document.getElementById("editIssueDesc").value.trim(),
    diagnosis_report: document.getElementById("editDiagnosis").value.trim() || null,
    warranty_cost: parseFloat(document.getElementById("editCost").value) || null,
    attachments: []
  };
  
  try {
    const res = await fetch(`${API_BASE}/${currentEditId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    
    if (res.ok) {
      showToast(`✅ Phiếu #${currentEditId} đã được cập nhật!`, "success");
      closeEditModal();
      await fetchClaims();
    } else {
      const errorData = await res.json().catch(() => ({}));
      showToast(`❌ Lỗi: ${errorData.detail || "Không thể cập nhật phiếu"}`, "error");
    }
  } catch (err) {
    console.error("Update error:", err);
    showToast("Kết nối server thất bại!", "error");
  }
}

async function approveClaim(id) {
  if (!confirm(`Xác nhận duyệt phiếu #${id}?`)) return;
  
  const button = event.target;
  button.disabled = true;
  button.textContent = "Đang xử lý...";
  
  try {
    const res = await fetch(`${API_BASE}/${id}/approve`, { method: "PUT" });
    if (res.ok) {
      showToast(`✅ Phiếu #${id} đã được duyệt!`, "success");
      await fetchClaims();
    } else {
      const errorData = await res.json().catch(() => ({}));
      showToast(`❌ Lỗi: ${errorData.detail || "Không thể duyệt phiếu"}`, "error");
      button.disabled = false;
      button.textContent = "✓ Duyệt";
    }
  } catch (err) {
    console.error("Approve error:", err);
    showToast("Kết nối server thất bại!", "error");
    button.disabled = false;
    button.textContent = "✓ Duyệt";
  }
}

async function rejectClaim(id) {
  if (!confirm(`Bạn chắc chắn muốn từ chối phiếu #${id}?`)) return;
  
  const button = event.target;
  button.disabled = true;
  button.textContent = "Đang xử lý...";
  
  try {
    const res = await fetch(`${API_BASE}/${id}/reject`, { method: "PUT" });
    if (res.ok) {
      showToast(`⚠️ Phiếu #${id} đã bị từ chối!`, "error");
      await fetchClaims();
    } else {
      const errorData = await res.json().catch(() => ({}));
      showToast(`❌ Lỗi: ${errorData.detail || "Không thể từ chối phiếu"}`, "error");
      button.disabled = false;
      button.textContent = "✗ Từ chối";
    }
  } catch (err) {
    console.error("Reject error:", err);
    showToast("Kết nối server thất bại!", "error");
    button.disabled = false;
    button.textContent = "✗ Từ chối";
  }
}

function filterClaims() {
  const search = searchInput.value.toLowerCase().trim();
  const status = statusFilter.value;
  
  const filtered = claims.filter(c => {
    const statusValue = typeof c.status === 'object' ? c.status.value : c.status;
    
    const matchSearch = !search || 
      c.vehicle_vin.toLowerCase().includes(search) ||
      (c.issue_desc || "").toLowerCase().includes(search) ||
      c.id.toString().includes(search);

    const matchStatus = status === "all" || statusValue === status;
    
    return matchSearch && matchStatus;
  });
  
  renderTable(filtered);
}

searchInput.addEventListener("input", filterClaims);
statusFilter.addEventListener("change", filterClaims);

editModal.addEventListener("click", (e) => {
  if (e.target === editModal) {
    closeEditModal();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  tableBody.innerHTML = `
    <tr>
      <td colspan="7" class="loading">
        <p>⏳ Đang tải dữ liệu...</p>
      </td>
    </tr>
  `;
  fetchClaims();
});