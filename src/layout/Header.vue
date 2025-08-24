<template>
    <header class="h-14  d-flex align-items-center justify-content-end px-6 border-bottom">
        <div class="notion text-decoration-none text-black fs-4 position-relative ">
            <i class="fa-solid fa-bell"></i>
            <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger p-1"
                style="font-size: 0.7rem;">3</span>
        </div>
        <div class="profile  d-flex align-items-center items-center space-x-2">
            <img src="/public/z6827970432778_2b43b97a704617f03c546e5bc7bd82e8.jpg" class="img h-8 rounded-full m-3" alt="User Avatar" />
            <!-- <div class=" d-flex align-items-center flex-column">
                <p class="m-0">Michael K.</p>
                <p class="m-0">Manager</p>
            </div> -->
        </div>
    </header>
</template>

<script setup>
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
