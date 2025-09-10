<template>
  <div>
    <Header />
    <TopNav />
    <div class="header-offset" aria-hidden="true">
    </div>

    <div class="crumb-bar">
      <nav class="breadcrumb-custom flex items-center gap-2 m-0 px-3">
        <RouterLink class="link" to="/" aria-label="Trang chủ">
          <i class="fas fa-home"></i>
        </RouterLink>
        <template v-for="(crumb, index) in breadcrumbs" :key="index">
          <span v-if="crumb.title" class="mx-1">/</span>
          <RouterLink v-if="crumb.title && index < breadcrumbs.length - 1" class="link" :to="crumb.path">
            {{ crumb.title }}
          </RouterLink>
          <span v-else-if="crumb.title" class="fw-medium">{{ crumb.title }}</span>
        </template>
      </nav>
    </div>

    <!-- Nội dung trang con -->
    <div class="px-3">
      <RouterView />
    </div>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import { computed } from "vue";
import Header from "../layout/Header.vue";
import TopNav from "../layout/TopNav.vue";

const route = useRoute();

function formatTitle(segment) {
  if (!segment) return "";
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}
const breadcrumbs = computed(() => {
  const segs = route.path.split("/").filter(s => s !== "");
  let path = "";
  return segs.map(seg => {
    path += "/" + seg;
    const isParam = Object.values(route.params).includes(seg);
    return { path, title: isParam ? null : formatTitle(seg) };
  }).filter(b => b.title !== null);
});
</script>

<style scoped>
/* Khớp chiều cao Header trong Header.vue */
.header-offset {
  height: 108px;
}

.crumb-bar {
  /* position: fixed; */
  max-width: fit-content;
}

.breadcrumb-custom {
  font-size: 12px;
  padding: 6px 0;
}

.link {
  color: #333;
  text-decoration: none;
}

.link:hover {
  color: #2c2ce9;
  text-decoration: underline;
}
</style>
