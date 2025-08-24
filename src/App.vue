<script setup>
</script>

<template>
  <div>
    <nav style="margin-bottom:20px;">
      <router-link to="/users">Danh sách Users</router-link> |
      <router-link to="/users/add">Thêm User</router-link>
    </nav>
    <router-view></router-view>
  </div>
</template>

<style scoped>
nav {
  background: #f5f5f5;
  padding: 10px;
}
nav a {
  margin-right: 10px;
  text-decoration: none;
  color: #333;
}
nav a.router-link-active {
  font-weight: bold;
  color: #42b983;
}
</style>
