import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export function ApiGetCall({ url, queryKey, waiting = true, retry = 3, data }) {
  const queryInfo = useQuery({
    enabled: waiting,
    queryKey: [queryKey],
    queryFn: async () => {
      const response = await axios.get(url, {
        params: data,
        headers: {
          "Content-Type": "application/json",
        },
        retry: retry,
      });
      return response.data;
    },
    staleTime: 5 * 10000,
    refetchOnWindowFocus: false,
    retry: retry,
  });
  return queryInfo;
}

export function ApiPostCall({ url, relatedQueryKeys, urlFromData = false }) {
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
        //take a one second break to let the API finish.
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: [relatedQueryKeys] });
        }, 1000);
      }
    },
  });
  return mutation;
}
