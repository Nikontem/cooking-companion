import { createRouter, createWebHistory } from 'vue-router'
import RecipeListView from './views/RecipeListView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'recipes',
      component: RecipeListView,
    },
    {
      path: '/recipe/:id',
      name: 'recipe-detail',
      component: () => import('./views/RecipeDetailView.vue'),
    },
    {
      path: '/shelf',
      name: 'shelf',
      component: () => import('./views/ShelfView.vue'),
    },
    {
      path: '/appliances',
      name: 'appliances',
      component: () => import('./views/AppliancesView.vue'),
    },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('./views/ChatView.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('./views/ProfileView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('./views/NotFoundView.vue'),
    },
  ],
})

export default router
