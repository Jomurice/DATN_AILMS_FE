<template>
    <header v-if="token != null" class="h-14  d-flex align-items-center justify-content-end px-6 border-bottom">
            <div class="notion text-decoration-none text-black fs-4 position-relative ">
                <i class="fa-solid fa-bell"></i>
                <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger p-1"
                    style="font-size: 0.7rem;">3</span>
            </div>
            <div class="profile  d-flex align-items-center items-center space-x-2">
                <router-link to="/profile" class="text-decoration-none text-black fs-5 me-3">
                    <img src="@/assets/attachment-3 (1).png" class="img h-8 rounded-full m-3" alt="User Avatar" />
                </router-link>
                <!-- <div class=" d-flex align-items-center flex-column">
                    <p class="m-0">Michael K.</p>
                    <p class="m-0">Manager</p>
                </div> -->
            </div>
    </header>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { tokenService } from '../../services/TokenService';

const auth = tokenService();
auth.loadToken();
const {token} = storeToRefs(auth)
console.log("tokeHerder",token.value);

</script>

<style scoped>
header {
    background-color: #ffffff;
}

.notion {
    margin-right: 20px;
    cursor: pointer;
}

.notion:hover {
    color: #007bff;
}

.profile {
    margin-right: 20px;
    cursor: pointer;
}


.img {
    border-radius: 30px 30px 30px 30px;
    width: 50px;
    height: 50px;
    object-fit: cover;
}

</style>
