import Swal from "sweetalert2"

export const useAlert = {
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
