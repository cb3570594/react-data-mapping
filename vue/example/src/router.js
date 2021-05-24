import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

const routes = [
  {
    path: '/',
    component: /*index*/ () => import( /* webpackChunkName: "index" */ './page/index.vue'),
    meta: {
      title: 'DTDesign-Vue数据映射组件'
    }
  },
];

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

//使用钩子函数对路由进行权限跳转
router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title}`;
  next();
});

export default router;
