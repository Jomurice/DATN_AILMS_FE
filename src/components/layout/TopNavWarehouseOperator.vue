<template>
    <div class="topnav-wrap" ref="topnavRef">
        <nav class="topnav">
            <div class="nav-center">
                <!-- Burger (mobile) -->
                <button class="burger" @click.stop="mobileOpen = !mobileOpen">☰</button>

                <!-- Menu -->
                <div class="nav-inner" :class="{ open: mobileOpen }">


                    <!-- HÀNG HÓA -->
                    <div class="menu-group">
                        <div class="tab" @click.stop="toggle('hanghoa')">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                            </svg>
                            Hàng hóa
                        </div>
                        <div class="dropdown" v-show="open === 'hanghoa'">
                            <RouterLink to="/product">Hàng hóa</RouterLink>
                        </div>
                    </div>

                    <!-- NHẬP / XUẤT -->
                    <div class="menu-group">
                        <div class="tab" @click.stop="toggle('nhapxuat')">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                            </svg>
                            Nhập / Xuất
                        </div>
                        <div class="dropdown" v-show="open === 'nhapxuat'">
                            <RouterLink to="/inbound">Nhập hàng</RouterLink>
                            <RouterLink to="/outbound">Xuất hàng</RouterLink>
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
const open = ref(null);

const toggle = (key) => {
    open.value = open.value === key ? null : key;
};


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
    .burger {
        display: block;
    }

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

    .nav-inner.open {
        display: flex;
    }

    .dropdown {
        position: static;
        background: rgba(255, 255, 255, 0.1);
        box-shadow: none;
    }

    .dropdown a {
        color: #fff;
    }
}
</style>
