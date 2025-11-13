<template>
  <div class="topnav-wrap">
    <nav class="topnav" role="navigation" aria-label="Main">
      <div class="nav-center">
        <div class="nav-inner">
          <RouterLink class="tab" to="/dashboard" exact-active-class="active">Trang chủ</RouterLink>
          <RouterLink class="tab" to="/product" exact-active-class="active">Hàng hóa</RouterLink>
          <RouterLink class="tab" to="/productDetails" exact-active-class="active">Hàng hóa chi tiết</RouterLink>
          <RouterLink class="tab" to="/category" exact-active-class="active">Loại hàng</RouterLink>
          <RouterLink class="tab" to="/inbound/new" exact-active-class="active">Đơn mua</RouterLink>
          <RouterLink class="tab" to="/inbound" exact-active-class="active">Nhập hàng</RouterLink>
          <RouterLink class="tab" to="/outbound/new" exact-active-class="active">Đơn xuất</RouterLink>
          <RouterLink class="tab" to="/outbound" exact-active-class="active">Xuất hàng</RouterLink>
          <!-- <RouterLink class="tab" to="/warehouse" exact-active-class="active">Kho</RouterLink> -->
          <RouterLink class="tab" to="/report" exact-active-class="active">Báo cáo</RouterLink>
          <RouterLink class="tab" to="/admin/account" exact-active-class="active">Nhân sự</RouterLink>
          <RouterLink class="tab" to="/warehousesmenu">Kho</RouterLink>
          <RouterLink class="tab" to="/purchaseorder">PO</RouterLink>
          <RouterLink class="tab" to="/suppliers">PO</RouterLink>
          <!-- <RouterLink class="tab" to="/report" exact-active-class="active">Tổng quát</RouterLink>
          <RouterLink class="tab" to="/report" exact-active-class="active">Khác</RouterLink> -->
        </div>
      </div>
    </nav>
    <div class="topnav-offset" aria-hidden="true"></div>
  </div>
</template>

<script setup>
</script>

<style scoped>

.topnav{ --topnav-h: 50px; }

.topnav-wrap{ width:100%; }
.topnav{
  position: fixed;
  top: 56px;               /* ↓ nằm ngay dưới Header 56px */
  left: 0; right: 0;
  z-index: 1100;           /* dưới Header */
  height: var(--topnav-h);
  display: flex; align-items: center;
  background: linear-gradient(90deg,#5f9bff 0%, #4c7dff 100%);
  border-bottom: 1px solid rgba(255,255,255,.15);
  box-shadow: 0 2px 10px rgba(0,0,0,.08);
  backdrop-filter: saturate(160%) blur(4px);
}

.nav-center{ max-width:100%; margin:0 auto; padding:0 12px; width:100%; display:flex; justify-content:start; align-items:center; }

.nav-inner{ display:inline-flex; gap:.5rem; overflow-x:auto; white-space:nowrap; scroll-snap-type:x mandatory; -ms-overflow-style:none; scrollbar-width:none; }
.nav-inner::-webkit-scrollbar{ display:none; }

.tab{
  scroll-snap-align:start;
  display:inline-flex; 
  align-items:center;
  color:#fff; 
  text-decoration:none;
  font-weight:600; 
  font-size:14px;
  padding:8px 14px;
  border-radius:10px;
  opacity:.9; 
  transition:background .2s, transform .12s, opacity .2s;
  position:relative;
}
.tab:hover{ background:rgba(12, 0, 244, 0.927); opacity:1; transform:translateY(-1px); }
.active{ background:rgb(12, 0, 244); opacity:1 !important; }
/* .active::after{
  content:""; position:absolute; left:14px; right:14px; bottom:6px;
  height:3px; border-radius:2px; background:#fff; box-shadow:0 1px 0 rgba(0,0,0,.08);
} */


/* offset chiều cao TopNav (nội dung sẽ bắt đầu sau TopNav) */
.topnav-offset{ height: var(--topnav-h); }

.tab:focus-visible{ outline:2px solid #fff; outline-offset:2px; }

/* Tuỳ chọn: nếu muốn giảm chiều cao TopNav ở màn nhỏ */
@media (max-width:420px){
  .topnav{ --topnav-h: 50px; }
  .tab{ padding:8px 12px; font-size:13px; }
  .active::after{ bottom:4px; }
}
</style>
