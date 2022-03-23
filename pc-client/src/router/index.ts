import Vue from "vue";
import VueRouter, { NavigationGuardNext, RouteConfig } from "vue-router";
import Home from "../views/home/Home.vue";
import store from "@/store"
import axios from "@/axios"

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/",
    name: 'Home',
    meta: { unAuth: true },
    redirect: '/local',
    component: Home,
    children: [
      //本地音乐
      {
        path: "local",
        meta: { unAuth: true },
        name: "Local",
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
          import(/* webpackChunkName: "about" */ "../views/local/Local.vue"),
      },
      //我的歌单
      {
        path:'musiclist/:type',
        name:'Likes',
        component: () => import("../views/likes/Likes.vue")
      },
      //创建歌单
      {
        path: 'createMusicList',
        name: 'CreateMusicList',
        component: () => import("../views/createmusiclist/CreateMusicList.vue")
      },
      //播放历史
      {
        path:'history',
        name:'History',
        component:()=>import("../views/history/History.vue")
      },
      //评论区
      {
        path:'topic/:id',
        name:'Topic',
        component:()=>import("../views/topic/Topic.vue")
      },
      //设置
      {
        path:'settings',
        name:'Settings',
        component:()=>import("../views/settings/Settings.vue")
      }
    ]
  },
  {
    path: "/deskiptext",
    meta: { unAuth: true },
    name: "DeskipText",
    component: () => import('../views/DeskipText.vue')
  }
];

const router = new VueRouter({
  routes,
});

//全局路由守卫获取用户信息
router.beforeEach((to, from, next) => {
  if (localStorage.token) {
    if (!to.meta.unAuth) {
      axios.defaults.headers.token = localStorage.token;
      axios.get('/users/usermessage').then(res => {
        store.commit('setUserMessage', res.data);
        next();
      }).catch(err => {
        next();
      })
    } else {
      axios.defaults.headers.token = localStorage.token;
      axios.get('/users/usermessage').then(res => {
        store.commit('setUserMessage', res.data);
      }).catch(err => {

      })
      next();
    }
  }else{
    next();
  }


})

export default router;
