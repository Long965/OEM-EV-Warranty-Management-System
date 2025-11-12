const API_BASE = "http://localhost:8000/claims"; // Gateway endpoint
const tableBody = document.getElementById("claimTableBody");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");

let claims = [];

// === Hiển thị thông báo popup ===
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

// === Gọi API để lấy danh sách phiếu ===
async function fetchClaims() {
  try {
    const res = await fetch(API_BASE + "/");
    if (!res.ok) throw new Error("Không thể tải dữ liệu");
    claims = await res.json();
    renderTable(claims);
  } catch (err) {
    showToast("Không thể tải danh sách phiếu!", "error");
  }
}

// === Hiển thị bảng ===
function renderTable(data) {
  tableBody.innerHTML = "";
  data.forEach(c => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${c.id}</td>
      <td>${c.vehicle_vin}</td>
      <td>${c.issue_desc || "—"}</td>
      <td>${c.warranty_cost ? c.warranty_cost.toLocaleString("vi-VN") : "—"}</td>
      <td><span class="status-badge ${c.status.toLowerCase()}">${c.status}</span></td>
      <td>
        ${c.status === "Submitted"
          ? `<button class="btn-approve" onclick="approveClaim(${c.id})">Duyệt</button>
             <button class="btn-reject" onclick="rejectClaim(${c.id})">Từ chối</button>`
          : `<i>—</i>`}
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// === Xử lý duyệt phiếu ===
async function approveClaim(id) {
  if (!confirm("Xác nhận duyệt phiếu #" + id + "?")) return;
  try {
    const res = await fetch(`${API_BASE}/${id}/approve`, { method: "PUT" });
    if (res.ok) {
      showToast("✅ Phiếu #" + id + " đã được duyệt!", "success");
      fetchClaims();
    } else {
      showToast("❌ Lỗi khi duyệt phiếu #" + id, "error");
    }
  } catch {
    showToast("Kết nối server thất bại!", "error");
  }
}

// === Xử lý từ chối phiếu ===
async function rejectClaim(id) {
  if (!confirm("Bạn chắc chắn muốn từ chối phiếu #" + id + "?")) return;
  try {
    const res = await fetch(`${API_BASE}/${id}/reject`, { method: "PUT" });
    if (res.ok) {
      showToast("⚠️ Phiếu #" + id + " đã bị từ chối!", "error");
      fetchClaims();
    } else {
      showToast("❌ Lỗi khi từ chối phiếu #" + id, "error");
    }
  } catch {
    showToast("Kết nối server thất bại!", "error");
  }
}

// === Bộ lọc & tìm kiếm ===
function filterClaims() {
  const search = searchInput.value.toLowerCase();
  const status = statusFilter.value;
  const filtered = claims.filter(c => {
    const matchSearch =
      c.vehicle_vin.toLowerCase().includes(search) ||
      (c.issue_desc || "").toLowerCase().includes(search);
    const matchStatus = status === "all" || c.status === status;
    return matchSearch && matchStatus;
  });
  renderTable(filtered);
}

searchInput.addEventListener("input", filterClaims);
statusFilter.addEventListener("change", filterClaims);

// === Khởi chạy ===
fetchClaims();
