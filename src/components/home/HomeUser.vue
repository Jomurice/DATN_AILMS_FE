<template>
  <div class="flex-1 flex flex-col">
    <Header />
  </div>
  <div class="d-flex gap-3">
    <Sidebar />

    <div class="w-100 m-3">
      <nav class="breadcrumb flex items-center gap-2 text-gray-600 mb-6">
    <RouterLink class="link" to="/">
      <i class="fas fa-home"></i>
    </RouterLink>
    <template v-for="(crumb, index) in breadcrumbs" :key="index">
      <span v-if="crumb.title">/</span>
      <RouterLink
        v-if="crumb.title && index < breadcrumbs.length - 1"
        class="link"
        :to="crumb.path"
      >
        {{ crumb.title }}
      </RouterLink>
      <span v-else-if="crumb.title" class="font-medium">{{ crumb.title }}</span>
    </template>
  </nav>

      <RouterView></RouterView>
    </div>

  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import { computed } from "vue";
import Header from "../layout/Header.vue";
import Sidebar from "../layout/Sidebar.vue";

const route = useRoute();

function formatTitle(segment) {
  if (!segment) return "";
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

const breadcrumbs = computed(() => {
  const segments = route.path.split("/").filter(s => s !== "");
  let path = "";

  return segments
    .map(seg => {
      path += "/" + seg;

      //kiem tra  xem seg co phai la id khong
      const isParam = Object.values(route.params).includes(seg);
      return {
        path,
        //neu isParam la id thi title se la null
        title: isParam ? null : formatTitle(seg)
      };
    })
    // neu breadcrumb la id thi se ko hiển thị
    .filter(bc => bc.title !== null); 
});
</script>




<style scoped>
.breadcrumb {
  font-size: 14px;
}

.link {
  color: #333;
  text-decoration: none;
  color: inherit;
}

.link:hover {
  color: rgb(44, 44, 233);
  text-decoration: underline;
}
</style>