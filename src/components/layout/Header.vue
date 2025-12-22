<template>
  <header class="app-header d-flex align-items-center justify-content-end px-3">
    <div class="d-flex align-items-center gap-3">

      <!-- Notifications -->
      <div class="notion">
        <i class="fa-solid fa-bell"></i>
      </div>

      <!-- Profile -->
      <div class="profile-wrapper">
        <div
          class="profile d-inline-flex align-items-center"
          @click.stop="menuOpen = !menuOpen"
        >
          <!-- User icon -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="profile-icon"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M17.982 18.725
                 A7.488 7.488 0 0 0 12 15.75
                 a7.488 7.488 0 0 0-5.982 2.975
                 m11.963 0
                 a9 9 0 1 0-11.963 0
                 M15 9.75
                 a3 3 0 1 1-6 0
                 a3 3 0 0 1 6 0Z"
            />
          </svg>
        </div>

        <!-- Overlay -->
        <div
          v-if="menuOpen"
          class="menu-overlay"
          @click="menuOpen = false"
        ></div>

        <!-- Dropdown -->
        <div v-if="menuOpen" class="profile-dropdown">
          <RouterLink
            to="/profile"
            class="dropdown-item"
            @click="menuOpen = false"
          >
            <svg class="dropdown-icon" viewBox="0 0 24 24">
              <path
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                d="M12 12a3 3 0 1 0 0-6
                   a3 3 0 0 0 0 6
                   m6 8
                   a6 6 0 0 0-12 0"
              />
            </svg>
            
            Hồ sơ cá nhân
          </RouterLink>

          <button
            class="dropdown-item logout"
            @click="showConfirm = true; menuOpen = false"
          >
            <svg class="dropdown-icon" viewBox="0 0 24 24">
              <path
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                d="M15 12H3
                   m6-6-6 6 6 6
                   m6-15h4
                   a2 2 0 0 1 2 2v14
                   a2 2 0 0 1-2 2h-4"
              />
            </svg>
            Đăng xuất
          </button>
        </div>
      </div>

    </div>
  </header>

  <!-- Confirm Logout Modal -->
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
const menuOpen = ref(false);
const showConfirm = ref(false);

function confirmLogout() {
  const token = localStorage.getItem("accessToken");

  api.post("/auth/logout", { token }).finally(() => {
    toast.success("Đăng xuất thành công!");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    showConfirm.value = false;
    window.location.replace("/login")
  });
}
</script>

<style scoped>
/* ===== HEADER ===== */
.app-header {
  position: fixed;
  inset: 0 0 auto 0;
  height: 56px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  z-index: 1200;
}

/* ===== NOTIFICATION ===== */
.notion {
  cursor: pointer;
  color: #374151;
}
.notion i {
  font-size: 26px; 
}
.notion:hover {
  color: #0d6efd;
}

/* ===== PROFILE ===== */
.profile-wrapper {
  position: relative;
}

.profile {
  cursor: pointer;
  color: #000;
  padding: 8px; 
  border-radius: 50%;
}
.profile:hover {
  background: #f3f4f6;
  color: #0d6efd;
}

.profile-icon {
  width: 32px;  
  height: 32px;
}

/* ===== OVERLAY ===== */
.menu-overlay {
  position: fixed;
  inset: 0;
  z-index: 1100;
}

/* ===== DROPDOWN ===== */
.profile-dropdown {
  position: absolute;
  right: 0;
  top: 48px;
  width: 180px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
  z-index: 1200;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px; 
  width: 100%;
  padding: 12px 16px; 
  font-size: 15px;
  background: transparent;
  border: none;
  cursor: pointer;
  text-decoration: none;
  color: #374151;
}

.dropdown-item:hover {
  background: #f3f4f6;
}

.dropdown-item.logout {
  color: #dc2626;
}

.dropdown-icon {
  width: 20px;  
  height: 20px;
}

/* ===== MODAL ===== */
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
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

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.btn-cancel {
  background: #2563eb;
  color: #fff;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
}

.btn-confirm {
  background: #6b7280;
  color: #fff;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
}
</style>
