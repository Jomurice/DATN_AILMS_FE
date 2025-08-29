<template>
  <div class="flex-1 flex flex-col">
    <Header />
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import { computed } from "vue";
import Header from "../layout/Header.vue";
import Sidebar from "../layout/Sidebar.vue";

const route = useRoute();

</script>




<style scoped>
</style>