import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Mesh",
    component: () => import("@/views/mesh.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
