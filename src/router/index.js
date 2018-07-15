import Vue from 'vue';
import Router from 'vue-router';
// 导入组件
import Login from '@/views/Login';
import Home from '@/views/Home';
import User from '@/views/Users/User';
import Rights from '@/views/roles/Rights';
import Roles from '@/views/roles/Roles';
import Category from '@/views/goods/Category';
// import OrderList from '@/views/orders/List';

Vue.use(Router);
export default new Router({
  routes: [
    {
      name: 'login',
      path: '/login',
      component: Login
    },
    {
      name: 'home',
      path: '/',
      component: Home,
      // 子路由，子路由的切换都是在组件Home中完成的
      children: [
        {
          name: 'users',
          path: '/users',
          component: User
        },
        {
          name: 'rights',
          path: '/rights',
          component: Rights
        },
        {
          name: 'category',
          path: '/categories',
          component: Category
        },
        {
          name: 'roles',
          path: '/roles',
          component: Roles
        }
        // {
        //   name: 'orders',
        //   path: '/orders',
        //   component: OrderList
        // }
      ]
    }
  ]
});
