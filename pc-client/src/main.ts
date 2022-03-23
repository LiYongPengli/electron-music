import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import axios from './axios';
import VueAxios from 'vue-axios'
import ElementUI from 'element-ui';
import Api from '@/apis';
import VueApi from '@/plugins/vue-api';
import "@/font/iconfont.js";
import 'element-ui/lib/theme-chalk/index.css';
import "@/font/iconfont.css";

Vue.use(ElementUI);
Vue.use(VueAxios,axios);
Vue.use(VueApi,Api);
Vue.config.productionTip = false;

initApp();

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");

function initApp(){
  store.commit('setLeftBar',require('./libs/leftbar.json'))
}
