import Swal from "sweetalert2"

export const useAlert = {
  // 新增的確認刪除方法
  async confirmDelete(stockCode) {
    const result = await Swal.fire({
      title: '確定刪除嗎？',
      text: `此操作無法復原，您確定要刪除代號為 ${stockCode} 的這筆交易紀錄嗎？`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '確定刪除',
      cancelButtonText: '取消',
      reverseButtons: true, // 讓「取消」在左邊，「確定」在右邊
    });
    return result.isConfirmed; 
  },

  loading(title = "處理中...", text = "") {
    return Swal.fire({
      title,
      text,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    })
  },
  success(title, text) {
    return Swal.fire({ icon: "success", title, text })
  },
  error(title, text) {
    return Swal.fire({ icon: "error", title, text })
  },
  warning(title, text) {
    return Swal.fire({ icon: "warning", title, text })
  },
  close() {
    Swal.close()
  }
}