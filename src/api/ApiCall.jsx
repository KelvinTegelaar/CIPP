import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export function ApiGetCall({ url, queryKey, waiting = true, retry = 3, data }) {
  //Todo: add errorMiddleware toast popup, but only after last retry has failed.
  const queryInfo = useQuery({
    enabled: waiting,
    queryKey: [queryKey],
    queryFn: async ({ signal }) => {
      const response = await axios.get(url, {
        signal: url === "/api/tenantFilter" ? null : signal,
        params: data,
        headers: {
          "Content-Type": "application/json",
        },
        retry: retry,
      });
      return response.data;
    },
    //set staletime to 10 minutes for all get queries.
    staleTime: 600000,
    refetchOnWindowFocus: false,
    retry: retry,
  });
  return queryInfo;
}

export function ApiPostCall({ url, relatedQueryKeys, urlFromData = false }) {
  //Todo: add errorMiddleware toast popup.
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data) => {
      if (urlFromData) {
        url = data.url;
        delete data.url;
      }
      return axios.post(url, data);
    },
    onSuccess: () => {
      if (relatedQueryKeys) {
        //take a one second break to let the API finish, then clear related caches.
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: [relatedQueryKeys] });
        }, 1000);
      }
    },
  });
  return mutation;
}
