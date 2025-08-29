<template>
  <aside ref="sidebarRef" class="sidebar" :class="{ active: isOpen }">
    <div>
      <input type="checkbox" id="toggleMain" hidden />
      <label for="toggleMain" class="menu fw-bold">
        MAIN MENU
        <span class="arrow"></span>
      </label>
      <nav>
        <ul class="submenu">
          <router-link to="/" class="link" @click="closeSidebar"><i class="fa-solid fa-house px-3"></i> Home</router-link>
          <router-link to="/outbound" class="link" @click="closeSidebar"><i class="fa-solid fa-paper-plane px-3"></i> Outbound</router-link>
          <router-link to="/products" class="link" @click="closeSidebar"><i class="fa-solid fa-box px-3"></i> Inbound</router-link>
          <router-link to="/admin/account" class="link" @click="closeSidebar"><i class="fa-solid fa-users px-3"></i> Account</router-link>
          <router-link to="/warehouse" class="link" @click="closeSidebar"><i class="fa-solid fa-warehouse px-3"></i> Warehouse</router-link>
          <router-link to="/message" class="link" @click="closeSidebar"><i class="fa-solid fa-message px-3"></i> Message</router-link>
        </ul>
      </nav>

      <input type="checkbox" id="toggleGeneral" hidden />
      <label for="toggleGeneral" class="menu fw-bold">
        GENERAL
        <span class="arrow"></span>
      </label>
      <nav>
        <ul class="submenu2">
          <router-link to="/report" class="link" @click="closeSidebar"><i class="fa-solid fa-flag px-3"></i> Report</router-link>
          <router-link to="/support" class="link" @click="closeSidebar"><i class="fa-solid fa-headset px-3"></i> Support</router-link>
        </ul>
      </nav>
    </div>

    <div class="others">
      <input type="checkbox" id="toggleOthers" hidden />
      <label for="toggleOthers" class="menu fw-bold">
        OTHERS
        <span class="arrow"></span>
      </label>
      <nav>
        <ul class="submenu">
          <router-link to="/settings" class="link" @click="closeSidebar"><i class="fa-solid fa-gear px-3"></i> Settings</router-link>
        </ul>
      </nav>
    </div>
  </aside>
</template>

<script  setup>
import { ref, onMounted, onUnmounted } from "vue";
import Sidebar from "../../JS/Sidebar.js"
const { isOpen, sidebarRef,toggleSidebar, closeSidebar,handleClickOutside } = Sidebar;

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});
onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.sidebar {
  background: #fff;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  padding: 10px;
  width: 220px;
  min-height: 100vh;
  transition: all 0.3s ease;
}

/* Link */
.link {
  display: block;
  max-width: 180px;
  padding: 10px 5px;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  text-decoration: none;
  border-radius: 6px;
}
.link:hover {
  background: #f0f0f0;
}

/* Menu toggle */
.menu {
  border-bottom: 1px solid #ddd;
  padding: 10px 5px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

/* Submenu ẩn mặc định */
.submenu, .submenu2 {
  display: none;
  margin-left: 10px;
  padding: 0;
}



/* Toggle hiển thị submenu */
#toggleMain:checked ~ nav .submenu,
#toggleGeneral:checked ~ nav .submenu2,
#toggleOthers:checked ~ nav .submenu {
  display: block;
}

/* Arrow xoay khi mở */
.arrow {
  margin-left: auto;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid #333;
  transition: transform 0.3s;
}
#toggleMain:checked + .menu .arrow,
#toggleGeneral:checked + .menu .arrow,
#toggleOthers:checked + .menu .arrow {
  transform: rotate(180deg);
}

.hamburger {
  display: none;
  font-size: 22px;
  background: none;
  border: none;
  cursor: pointer;
  margin: 10px;
}
@media (max-width: 768px) {
  .hamburger {
    display: block;
    position: fixed;
    top: 15px;
    left: 15px;
    z-index: 1100;
  }
}

/* Responsive tablet */
@media (max-width: 1024px) {
  .sidebar {
    width: 210px;
  }
  .link {
    font-size: 14px;
  }
}

/* Responsive mobile */
@media (max-width: 796px) {
  .sidebar {
    position: fixed;
    left: -220px;
    top: 83px;
    max-height: 800px;
    z-index: 1000;
  }

  .sidebar.active {
    left: 0;
  }
}
</style>
