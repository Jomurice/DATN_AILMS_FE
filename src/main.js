import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import Multiselect from 'vue-multiselect'
import { Toaster } from "vue-sonner";

import 'vue-multiselect/dist/vue-multiselect.css'

import 'vue-sonner/style.css'

// Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

const app = createApp(App);

app.use(router);
app.use(createPinia());

app.component('Multiselect', Multiselect);
app.component('Toaster', Toaster);

app.mount('#app');
