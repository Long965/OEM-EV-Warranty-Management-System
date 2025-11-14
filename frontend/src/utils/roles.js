// mapping đơn giản theo seed DB
export const ROLE_BY_ID = { 1:'Admin', 2:'SC_Staff', 3:'SC_Technician', 4:'EVM_Staff' }
export const SELECTABLE_ROLES = [
  { id: 2, name: 'SC_Staff' },
  { id: 3, name: 'SC_Technician' },
  { id: 4, name: 'EVM_Staff' },
  { id: 1, name: 'Admin' } // chỉ cho Admin khi tạo user trong trang Users
]
