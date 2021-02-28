import Vue from 'vue'
import VueRouter from 'vue-router'
import ScreenPage from '../views/ScreenPage.vue'

Vue.use(VueRouter)

const routes = [{
  path: '/',
  redirect: '/screen'
},
{
  path: '/screen',
  component: ScreenPage
},
{
  path: '/seller',
  name: 'Seller',
  component: () => import('../views/SellerPage.vue')
},
{
  path: '/trend',
  name: 'Trend',
  component: () => import('../views/TrendPage.vue')
}, {
  path: '/map',
  name: 'Map',
  component: () => import('../views/MapPage.vue')
}, {
  path: '/rank',
  name: 'Rank',
  component: () => import('../views/RankPage.vue')
}, {
  path: '/hot',
  name: 'Hot',
  component: () => import('../views/HotPage.vue')
}, {
  path: '/stock',
  name: 'Stock',
  component: () => import('../views/StockPage.vue')
}
]

const router = new VueRouter({
  // mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router