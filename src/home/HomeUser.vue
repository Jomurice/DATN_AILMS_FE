<template>
    <div class="flex-1 flex flex-col">
        <Header />
    </div>
    <div class="d-flex gap-3">
        <Sidebar />

        <main class="col-md-10 p-6 overflow-y-auto">
            <Profile />
        </main>
    </div>
</template>

<script setup>
import Sidebar from "../layout/Sidebar.vue";
import Header from "../layout/header.vue";

import Profile from "../account/Profile.vue";


</script>
