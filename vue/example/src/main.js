import Vue from 'vue';
import App from './App.vue';
import router from './router.js';

import './assets/css/main.css';


new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
