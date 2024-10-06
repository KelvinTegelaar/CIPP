import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { isAxiosError } from "axios";
import { useDispatch } from "react-redux";
import { showToast } from "../store/toasts";
import { getCippError } from "../utils/get-cipp-error";

export function ApiGetCall({
  url,
  queryKey,
  waiting = true,
  retry = 3,
  data,
  bulkRequest = false,
  toast = false,
  onResult, // Add a callback to handle each result as it arrives
}) {
  const dispatch = useDispatch();
  const MAX_RETRIES = retry;
  const HTTP_STATUS_TO_NOT_RETRY = [401, 403, 404];
  const retryFn = (failureCount, error) => {
    let returnRetry = true;
    if (failureCount >= MAX_RETRIES) {
      returnRetry = false;
    }
    if (isAxiosError(error) && HTTP_STATUS_TO_NOT_RETRY.includes(error.response?.status ?? 0)) {
      returnRetry = false;
    }

    if (returnRetry === false && toast) {
      dispatch(
        showToast({
          message: getCippError(error),
          title: "Error",
          toastError: error,
        })
      );
    }
    return returnRetry;
  };

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
        });
        return response.data;
      }
    },
    staleTime: 600000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: retryFn,
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

export function ApiGetCallWithPagination({
  url,
  queryKey,
  retry = 3,
  data,
  toast = false,
  waiting = true,
}) {
  const dispatch = useDispatch();
  const MAX_RETRIES = retry;
  const HTTP_STATUS_TO_NOT_RETRY = [401, 403, 404];

  const retryFn = (failureCount, error) => {
    let returnRetry = true;
    if (failureCount >= MAX_RETRIES) {
      returnRetry = false;
    }
    if (isAxiosError(error) && HTTP_STATUS_TO_NOT_RETRY.includes(error.response?.status ?? 0)) {
      returnRetry = false;
    }

    if (returnRetry === false && toast) {
      dispatch(
        showToast({
          message: getCippError(error),
          title: "Error",
          toastError: error,
        })
      );
    }
    return returnRetry;
  };

  const queryInfo = useInfiniteQuery({
    queryKey: [queryKey],
    enabled: waiting,
    queryFn: async ({ pageParam = null, signal }) => {
      const response = await axios.get(url, {
        signal: signal,
        params: { ...data, ...pageParam },
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      // Check if there's a nextLink in the last page's metadata
      return lastPage?.Metadata?.nextLink ? { nextLink: lastPage.Metadata.nextLink } : undefined;
    },
    staleTime: 600000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: retryFn,
  });

  return queryInfo;
}
