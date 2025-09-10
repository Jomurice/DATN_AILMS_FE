<template>
  <header class="app-header d-flex align-items-center justify-content-end px-3">
    <div class="d-flex align-items-center gap-3">
      <div class="notion position-relative">
        <i class="fa-solid fa-bell fs-5"></i>
        <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger p-1"
              style="font-size: 0.7rem;">3</span>
      </div>
      <RouterLink to="/profile" class="d-inline-flex align-items-center">
        <img src="@/assets/attachment-3 (1).png" class="img" alt="User" />
      </RouterLink>
    </div>
  </header>
</template>

<script setup>
</script>

<style scoped>
/* Header cố định trên cùng */
.app-header{
  position: fixed;
  inset: 0 0 auto 0;   /* top:0; left:0; right:0 */
  height: 56px;
  z-index: 1200;       /* cao hơn TopNav */
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}
.img{ width:40px; height:40px; border-radius:999px; object-fit:cover; }
.notion{ cursor:pointer; }
.notion:hover{ color:#0d6efd; }
</style>
