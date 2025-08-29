<template>
    <header class="d-flex align-items-center justify-content-between px-3 py-2 border-bottom bg-white">

        <button ref="buttonRef" class="hamburger" @click="toggleSidebar">☰</button>

        <div class="d-flex align-items-center ms-auto">
            <div class="notion position-relative me-3">
                <i class="fa-solid fa-bell fs-4"></i>
                <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger p-1"
                    style="font-size: 0.7rem;">3</span>
            </div>
            <router-link to="/profile">
                <img src="@/assets/attachment-3 (1).png" class="img" alt="User img" />
            </router-link>
        </div>
    </header>

</template>

<script setup>
import { storeToRefs } from 'pinia';
import { tokenService } from '../../services/TokenService';
import { ref, onMounted, onUnmounted } from "vue";

import Sidebar from "../../JS/Sidebar.js"
const { isOpen,buttonRef,toggleSidebar, handleClickOutside } = Sidebar;

const auth = tokenService();
auth.loadToken();
const { token } = storeToRefs(auth)
console.log("tokeHerder", token.value);



onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});
onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
header {
    background-color: #ffffff;
}

.notion {
    margin-right: 20px;
    cursor: pointer;
}

.notion:hover {
    color: #007bff;
}

.profile {
    cursor: pointer;
}


.img {
    border-radius: 30px 30px 30px 30px;
    width: 50px;
    height: 50px;
    object-fit: cover;
}

.hamburger {
  font-size: 22px;
  background: none;
  border: none;
  cursor: pointer;
}

@media (min-width: 769px) {
  .hamburger {
    display: none;
  }

  .img {
    border-radius: 30px 30px 30px 30px;
    width: 40px;
    height: 40px;
    object-fit: cover;
}
}

</style>
