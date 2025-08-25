<template>
    <div class="flex-1 flex flex-col">
        <Header />
    </div>
    <div class="d-flex gap-3">
        <Sidebar />

        <main class="col-md-10 p-6 overflow-y-auto">
            <!-- <AccountManagerment /> -->
            <Profile />
        </main>
    </div>
</template>

<script setup>
import Header from "../layout/Header.vue";
import Sidebar from "../layout/Sidebar.vue";
import Profile from "../account/Profile.vue";
</script>

<style scoped>

</style>