<template>
  <aside class="bg-white shadow-md border col-md-2 d-flex flex-column justify-content-between">
    <div>
      <!-- MAIN MENU -->
      <input type="checkbox" id="toggleMain" hidden />
      <label for="toggleMain" class="fs-5 m-1 menu fw-bold">
        MAIN MENU
        <span class="arrow"></span>
      </label>
      <nav class="mt-2">
        <ul class="p-0 submenu">
          <li class="px-4 py-2 hover:bg-light cursor-pointer">
            <i class="fa-solid fa-house px-3"></i> Home
          </li>
          <li class="px-4 py-2 hover:bg-light cursor-pointer">
            <i class="fa-solid fa-paper-plane px-3"></i> Outbound
          </li>
          <li class="px-4 py-2 hover:bg-light cursor-pointer">
            <i class="fa-solid fa-box px-3"></i> Inbound
          </li>
          <li class="px-4 py-2 hover:bg-light cursor-pointer">
            <i class="fa-solid fa-message px-3"></i> Message
          </li>
        </ul>
      </nav>

      <!-- GENERAL -->
      <input type="checkbox" id="toggleGeneral" hidden />
      <label for="toggleGeneral" class="fs-5 mt-3 menu fw-bold">
        GENERAL
        <span class="arrow"></span>
      </label>
      <nav class="mt-2">
        <ul class="p-0 submenu">
          <li class="px-4 py-2 hover:bg-light cursor-pointer">
            <i class="fa-solid fa-flag px-3"></i> Report
          </li>
          <li class="px-4 py-2 hover:bg-light cursor-pointer">
            <i class="fa-solid fa-headset px-3"></i> Support
          </li>
        </ul>
      </nav>
    </div>

    <!-- OTHERS -->
    <div class="mb-4 others">
      <input type="checkbox" id="toggleOthers" hidden />
      <label for="toggleOthers" class="fs-5 menu fw-bold">
        OTHERS
        <span class="arrow"></span>
      </label>
      <nav class="mt-2">
        <ul class="p-0 submenu">
          <li class="px-4 cursor-pointer">
            <i class="fa-solid fa-gear px-3"></i> Settings
          </li>
        </ul>
      </nav>
    </div>
  </aside>
</template>

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

.menu {
  border-bottom: 1px solid #ccc;
  padding-bottom: 5px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.submenu {
  display: none;
  margin-left: 10px;
}

/* MAIN */
#toggleMain:checked ~ nav .submenu {
  display: block;
}
#toggleMain:checked + .menu .arrow {
  transform: rotate(180deg);
}

/* GENERAL */
#toggleGeneral:checked ~ nav .submenu {
  display: block;
}
#toggleGeneral:checked + .menu .arrow {
  transform: rotate(180deg);
}

/* OTHERS */
#toggleOthers:checked ~ nav .submenu {
  display: block;
}
#toggleOthers:checked + .menu .arrow {
  transform: rotate(180deg);
}

/* Mũi tên */
.arrow {
  display: inline-block;
  width: 0;
  height: 0;
  margin-left: 8px;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid #333;
  transition: transform 0.3s;
}
</style>
