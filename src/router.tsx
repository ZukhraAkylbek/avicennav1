import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  // Передаём данные запросов с сервера в браузер: иначе первый рендер в браузере
  // отличается от серверного и React сообщает об ошибке гидратации.
  setupRouterSsrQueryIntegration({ router, queryClient });

  return router;
};
