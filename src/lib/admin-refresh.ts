import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";

/**
 * После любого сохранения в админке публичные страницы должны показать новые данные.
 * Сбрасываем весь кэш запросов (и админских, и сайтовых) и просим роутер
 * перезагрузить данные маршрутов, иначе сайт продолжает показывать старую копию.
 */
export function useSiteRefresh() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useCallback(async () => {
    await queryClient.invalidateQueries();
    await router.invalidate();
  }, [queryClient, router]);
}
