import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export function ApiGetCall({
  url,
  queryKey,
  waiting = true,
  retry = 3,
  data,
  bulkRequest = false,
  onResult, // Add a callback to handle each result as it arrives
}) {
  //todo: errorToasts when enabled.
  //todo: load first page, inject other data with later load, invisible pagiantion.
  const queryInfo = useQuery({
    enabled: waiting,
    queryKey: [queryKey],
    queryFn: async ({ signal }) => {
      if (bulkRequest && Array.isArray(data)) {
        const results = [];
        for (let i = 0; i < data.length; i++) {
          const element = data[i];
          const response = await axios.get(url, {
            signal: signal,
            params: element,
            headers: {
              "Content-Type": "application/json",
            },
            retry: retry,
          });
          results.push(response.data);
          if (onResult) {
            onResult(response.data); // Emit each result as it arrives
          }
        }
        return results;
      } else {
        const response = await axios.get(url, {
          signal: url === "/api/tenantFilter" ? null : signal,
          params: data,
          headers: {
            "Content-Type": "application/json",
          },
          retry: retry,
        });
        return response.data;
      }
    },
    staleTime: 600000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: retry,
  });

  return queryInfo;
}

export function ApiPostCall({
  relatedQueryKeys,
  onResult, // Add a callback to handle each result as it arrives
}) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({ url, bulkRequest, data }) => {
      if (bulkRequest && Array.isArray(data)) {
        const results = [];
        for (let i = 0; i < data.length; i++) {
          let element = data[i];
          const response = await axios.post(url, element);
          results.push(response);
          if (onResult) {
            onResult(response.data); // Emit each result as it arrives
          }
        }
        return results;
      } else {
        const response = await axios.post(url, data);
        if (onResult) {
          onResult(response.data); // Emit each result as it arrives
        }
        return response;
      }
    },
    onSuccess: () => {
      if (relatedQueryKeys) {
        // Take a one-second break to let the API finish, then clear related caches.
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: [relatedQueryKeys] });
        }, 1000);
      }
    },
  });

  return mutation;
}
