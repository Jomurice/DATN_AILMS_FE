<script setup>
import HomeUser from './components/home/HomeUser.vue';

</script>
<style>
html,
body,
#app {
  background: #eff0f3 !important;
  background-image: none !important;
}
[data-sonner-toast] button {
  opacity: 1 !important;
  color:black !important;
  background-color: rgb(255, 255, 255) !important;
}

[data-sonner-toast] button:hover {
  opacity: 0.7;
}
</style>


<template>
  <RouterView />
  <Toaster rich-colors position="top-right" :duration="3000"  close-button />
</template>
