<template>
  <div>
    <Header />
    <TopNav />
    <div class="header-offset" aria-hidden="true">
    </div>

    <!-- <div class="crumb-bar">
      <nav class="breadcrumb-custom flex items-center gap-2">
        <RouterLink class="link" to="/dashboard" aria-label="Trang chủ">
          <i class="fas fa-home"></i>
        </RouterLink>

        <template v-for="(crumb, index) in breadcrumbs" :key="index">
          <span class="mx-1">/</span>

          <RouterLink v-if="index < breadcrumbs.length - 1" class="link" :to="crumb.path">
            {{ crumb.title }}
          </RouterLink>

          <span v-else class="fw-medium">{{ crumb.title }}</span>
        </template>
      </nav>
    </div> -->

    <!-- Nội dung trang con -->
    <div class="px-3 mt-3">
      <RouterView />
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { computed } from "vue";
// import { routes } from "../../router";
import Header from "../layout/Header.vue";
import TopNav from "../layout/TopNav.vue"

const route = useRoute();
const router = useRouter();

// function findParentTitle(routePath) {
//   for (const r of routes) {
//     if (r.children) {
//       const match = r.children.find(c => router.resolve(c.path).href === routePath);
//       if (match && r.meta?.title) return r.meta.title;
//     }
//   }
//   return null;
// }

// const breadcrumbs = computed(() => {
//   return route.matched
//     .filter(r => r.meta?.title)
//     .map(r => {
//       const paramKeys = (r.path.match(/:([^/]+)/g) || []).map(k => k.substring(1));
//       const params = {};
//       paramKeys.forEach(k => {
//         if (route.params[k]) params[k] = route.params[k];
//       });

//       // Lấy cả title của route cha
//       const parentTitle = findParentTitle(r.path);
//       return {
//         title: parentTitle ? `${parentTitle} / ${r.meta.title}` : r.meta.title,
//         path: router.resolve({ name: r.name, params }).href
//       };
//     });
// });

</script>



<style scoped>
/* Khớp chiều cao Header trong Header.vue */

.header-offset {
  height: 108px;
}

.crumb-bar {
  /* position: fixed; */
  margin-left: 5px;
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
