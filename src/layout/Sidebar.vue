<template>
  <aside class=" bg-white shadow-md border col-md-2  flex flex-col justify-between">
    <div>
      <h4 class="fs-5 m-1">MAIN MENU</h4>
      <nav class="mt-2">
        <ul class="p-0">

            <li class="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                <i class="fa-solid fa-house px-3"></i>
                Home
            </li>

            <li class="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                <i class="fa-solid fa-paper-plane px-3"></i>
                Ountbound
            </li>

            <li class="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                <i class="fa-solid fa-box px-3"></i>
                Inbound
            </li>

            <li class="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                <i class="fa-solid fa-message px-3"></i>
                Message
            </li>
        </ul>
      </nav>

      <h4 class="fs-5">GENERAL</h4>
      <nav class="mt-2">
        <ul class="p-0">
            <li class="px-4 py-2 hover:bg-gray-100 cursor-pointer">
            <i class="fa-solid fa-flag px-3"></i>
                Report
            </li>
            <li class="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                <i class="fa-solid fa-headset px-3"></i>
                Support
            </li>
        </ul>
      </nav>
    </div>

    <div class="mb-4 others">
      <h4 class="fs-5">OTHERS</h4>
      <nav class="mt-2">
        <ul class="p-0">
          <li class=" px-4  cursor-pointer">
            <i class="fa-solid fa-gear px-3"></i>
            Settings
          </li>
        </ul>
      </nav>
    </div>
  </aside>
</template>

<script setup>
const mainMenu = ["Home", "Outbound", "Inbound", "Message"];

</script>

<style scoped>

aside {
    width: 230px;
    min-height: 100vh;
}
li {
    font-size: 16px;
    color: #333;
    font-weight: 500;
    list-style: none;
    line-height: 2;
}

.others {
    margin-top: 150px;
}
</style>
