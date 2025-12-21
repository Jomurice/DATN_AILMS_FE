<template>
  <div>
    <Header />

    <div v-if="rolesLoaded">
      <TopNavAdmin v-if="role === 'ADMIN'" />
      <TopNavLogisticManager v-if="role === 'LM'" />
      <TopNavWarehouseOperator v-if="role === 'WO'" />
    </div>

    <div class="header-offset" aria-hidden="true"></div>

    
    <div class="px-3 mt-3">
      <RouterView />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { tokenService } from "../../services/TokenService";

import Header from "../layout/Header.vue";
import TopNavAdmin from "../layout/TopNavAdmin.vue";
import TopNavWarehouseOperator from "../layout/TopNavWarehouseOperator.vue";
import TopNavLogisticManager from "../layout/TopNavLogisticManager.vue";

const role = ref("");
const rolesLoaded = ref(false);

const authState = tokenService();


function loadUserRole() {

  role.value = authState.role || "";  
  rolesLoaded.value = true;
}

onMounted(() => {
  loadUserRole();
});
</script>

<style scoped>
.header-offset {
  height: 108px;
}

.px-3 {
  padding-left: 12px;
  padding-right: 12px;
}

.mt-3 {
  margin-top: 12px;
}
</style>
