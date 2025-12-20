<template>
  <header class="app-header d-flex align-items-center justify-content-end px-3">
    <div class="d-flex align-items-center gap-3">

      <button class="logout-btn" @click="showConfirm = true">Đăng xuất</button>
      <div class="notion">
        <i class="fa-solid fa-bell fs-5"></i>
      </div>
      <RouterLink to="/profile" class="profile d-inline-flex align-items-center">
        <i class="fa-regular fa-circle-user fs-1"></i>
      </RouterLink>

    </div>
  </header>

  <div v-if="showConfirm" class="modal-mask">
    <div class="modal-box">
      <p class="title">Bạn có chắc chắn muốn đăng xuất không?</p>

      <div class="modal-actions">
        <button class="btn-cancel" @click="showConfirm = false">
          Huỷ
        </button>
        <button class="btn-confirm" @click="confirmLogout">
          Chắc chắn
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "@/services/axios";

const router = useRouter();
const showConfirm = ref(false);

function confirmLogout() {
  const token = localStorage.getItem("accessToken");

  api.post("/auth/logout", {
    token: token
  }).finally(() => {
    localStorage.removeItem("accessToken");
    showConfirm.value = false;
    router.replace("/login");
  });
}


</script>
<style scoped>
/* ===== HEADER ===== */
.app-header {
  position: fixed;
  inset: 0 0 auto 0;
  height: 56px;
  z-index: 1200;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}

.logout-btn {
  border: none;
  background: transparent;
  font-weight: 500;
  color: #374151;
}

.logout-btn:hover {
  color: #dc2626;
}

.notion {
  cursor: pointer;
}

.notion:hover {
  color: #0d6efd;
}

.profile {
  color: black;
}

.profile:hover {
  color: #0d6efd;
}

/* ===== MODAL ===== */
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-box {
  width: 300px;
  background: #fff;
  padding: 18px;
  border-radius: 10px;
  text-align: center;
}

.title {
  margin-bottom: 16px;
  font-weight: 500;
}

/* 👉 2 nút gần nhau hơn */
.modal-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
}

/* Huỷ – xanh */
.btn-cancel {
  background: #2563eb;
  color: #fff;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
}

/* Chắc chắn – xám */
.btn-confirm {
  background: #6b7280;
  color: #fff;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
}
</style>


