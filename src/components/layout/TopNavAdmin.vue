<template>
  <div class="topnav-wrap" ref="topnavRef">
    <nav class="topnav">
      <div class="nav-center">
        <!-- Burger (mobile) -->
        <button class="burger" @click.stop="mobileOpen = !mobileOpen">☰</button>

        <!-- Menu -->
        <div class="nav-inner" :class="{ open: mobileOpen }">
          <!-- CHUNG -->
          <div class="menu-group">
            <div class="tab" @click.stop="toggle('chung')">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12 8.954 3.045c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/>
              </svg>
              Chung
            </div>
            <div class="dropdown" v-show="open === 'chung'">
              <RouterLink to="/dashboard">Trang chủ</RouterLink>
            </div>
          </div>

          <!-- HÀNG HÓA -->
          <div class="menu-group">
            <div class="tab" @click.stop="toggle('hanghoa')">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"/>
              </svg>
              Hàng hóa
            </div>
            <div class="dropdown" v-show="open === 'hanghoa'">
              <RouterLink to="/product">Hàng hóa</RouterLink>
              <RouterLink to="/category">Loại hàng</RouterLink>
            </div>
          </div>

          <!-- NHẬP / XUẤT -->
          <div class="menu-group">
            <div class="tab" @click.stop="toggle('nhapxuat')">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"/>
              </svg>
              Nhập / Xuất
            </div>
            <div class="dropdown" v-show="open === 'nhapxuat'">
              <RouterLink to="/inbound/new">Đơn mua</RouterLink>
              <RouterLink to="/inbound">Nhập hàng</RouterLink>
              <RouterLink to="/outbound/new">Đơn xuất</RouterLink>
              <RouterLink to="/outbound">Xuất hàng</RouterLink>
            </div>
          </div>

          <!-- KIỂM KÊ -->
          <div class="menu-group">
            <div class="tab" @click.stop="toggle('kiemke')">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"/>
              </svg>
              Kiểm kê
            </div>
            <div class="dropdown" v-show="open === 'kiemke'">
              <RouterLink to="/inventory-check/new">Tạo phiếu kiểm</RouterLink>
              <RouterLink to="/inventory-check">Kiểm kê kho</RouterLink>
              <RouterLink to="/inventory-report">Báo cáo</RouterLink>
            </div>
          </div>

          <!-- HỆ THỐNG -->
          <div class="menu-group">
            <div class="tab" @click.stop="toggle('hethong')">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5"/>
              </svg>
              Hệ thống
            </div>
            <div class="dropdown" v-show="open === 'hethong'">
              <RouterLink to="/warehousesmenu">Kho</RouterLink>
              <RouterLink to="/admin/account">Nhân sự</RouterLink>
              <RouterLink to="/suppliers">Nhà phân phối</RouterLink>
              <RouterLink to="/customer">Khách hàng</RouterLink>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <div class="topnav-offset"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

const mobileOpen = ref(false);
const open = ref(null); // только один открытый раздел

const toggle = (key) => {
  open.value = open.value === key ? null : key;
};

// Закрытие при клике вне
const topnavRef = ref(null);

const handleClickOutside = (event) => {
  if (topnavRef.value && !topnavRef.value.contains(event.target)) {
    mobileOpen.value = false;
    open.value = null;
  }
};

onMounted(() => document.addEventListener("click", handleClickOutside));
onBeforeUnmount(() => document.removeEventListener("click", handleClickOutside));
</script>

<style scoped>
.topnav {
  --topnav-h: 50px;
  position: fixed;
  top: 56px;
  left: 0;
  right: 0;
  z-index: 1100;
  height: var(--topnav-h);
  background: linear-gradient(90deg, #5f9bff, #4c7dff);
  display: flex;
  align-items: center;
}
.nav-center {
  width: 100%;
  padding: 0 12px;
  display: flex;
  align-items: center;
}
.burger {
  display: none;
  font-size: 22px;
  background: none;
  border: none;
  color: #fff;
}
.nav-inner {
  display: flex;
  gap: 10px;
}
.menu-group {
  position: relative;
}
.tab {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  padding: 8px 14px;
  border-radius: 10px;
  cursor: pointer;
  opacity: 0.9;
}
.tab:hover {
  background: rgb(12, 0, 244);
  opacity: 1;
}
.tab svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}
.dropdown {
  position: absolute;
  top: 110%;
  left: 0;
  min-width: 200px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  padding: 6px;
  display: flex;
  flex-direction: column;
  z-index: 2000;
}
.dropdown a {
  padding: 8px 12px;
  border-radius: 8px;
  text-decoration: none;
  color: #333;
  font-size: 14px;
}
.dropdown a:hover,
.dropdown a.router-link-exact-active {
  background: #6084e4;
  font-weight: 600;
}
.topnav-offset {
  height: var(--topnav-h);
}
/* MOBILE */
@media (max-width: 768px) {
  .burger { display: block; }
  .nav-inner {
    position: absolute;
    top: var(--topnav-h);
    left: 0;
    right: 0;
    background: #4c7dff;
    flex-direction: column;
    padding: 10px;
    display: none;
  }
  .nav-inner.open { display: flex; }
  .dropdown {
    position: static;
    background: rgba(255, 255, 255, 0.1);
    box-shadow: none;
  }
  .dropdown a { color: #fff; }
}
</style>
