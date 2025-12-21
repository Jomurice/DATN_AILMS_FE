<template>
  <header class="app-header d-flex align-items-center justify-content-end px-3">
    <div class="d-flex align-items-center gap-3">

      <button class="logout-btn" @click="showConfirm = true">Đăng xuất</button>
      <div class="notion">
        <i class="fa-solid fa-bell fs-5"></i>
      </div>
      <RouterLink to="/profile" class="profile d-inline-flex align-items-center">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
</svg>

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
import { toast } from "vue-sonner";

const router = useRouter();
const showConfirm = ref(false);

function confirmLogout() {
  const token = localStorage.getItem("accessToken");

  api.post("/auth/logout", {
    token: token
  }).finally(() => {
    toast.success("Đăng xuất thành công!");
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
.size-6 {
  width: 30px;
  height: 30px;
}
</style>


