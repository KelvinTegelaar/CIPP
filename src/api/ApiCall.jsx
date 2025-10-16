import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { isAxiosError } from "axios";
import { useDispatch } from "react-redux";
import { showToast } from "../store/toasts";
import { getCippError } from "../utils/get-cipp-error";

export function ApiGetCall(props) {
  const {
    url,
    queryKey,
    relatedQueryKeys,
    waiting = true,
    retry = 3,
    data,
    bulkRequest = false,
    toast = false,
    onResult,
    staleTime = 300000,
    refetchOnWindowFocus = false,
    refetchOnMount = true,
    refetchOnReconnect = true,
    keepPreviousData = false,
    refetchInterval = false,
  } = props;
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const MAX_RETRIES = retry;
  const HTTP_STATUS_TO_NOT_RETRY = [302, 401, 403, 404, 500];
  const retryFn = (failureCount, error) => {
    let returnRetry = true;
    if (failureCount >= MAX_RETRIES) {
      returnRetry = false;
    }
    if (isAxiosError(error) && HTTP_STATUS_TO_NOT_RETRY.includes(error.response?.status ?? 0)) {
      if (
        error.response?.status === 302 &&
        error.response?.headers.get("location").includes("/.auth/login/aad")
      ) {
        queryClient.invalidateQueries({ queryKey: ["authmecipp"] });
      }
      returnRetry = false;
    }
    if (returnRetry === false && toast) {
      dispatch(
        showToast({
          message: `${getCippError(error)}`,
          title: `${
            error.config?.params?.tenantFilter ? error.config?.params?.tenantFilter : ""
          } Error`,
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
        if (relatedQueryKeys) {
          const clearKeys = Array.isArray(relatedQueryKeys) ? relatedQueryKeys : [relatedQueryKeys];
          setTimeout(() => {
            // Separate wildcard patterns from exact keys
            const wildcardPatterns = clearKeys
              .filter((key) => key.endsWith("*"))
              .map((key) => key.slice(0, -1));
            const exactKeys = clearKeys.filter((key) => !key.endsWith("*"));

            // Use single predicate call for all wildcard patterns
            if (wildcardPatterns.length > 0) {
              queryClient.invalidateQueries({
                predicate: (query) => {
                  if (!query.queryKey || !query.queryKey[0]) return false;
                  const queryKeyStr = String(query.queryKey[0]);
                  return wildcardPatterns.some((pattern) => queryKeyStr.startsWith(pattern));
                },
              });
            }

            // Handle exact keys
            exactKeys.forEach((key) => {
              queryClient.invalidateQueries({ queryKey: [key] });
            });
          }, 1000);
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
        if (onResult) {
          onResult(response.data); // Emit each result as it arrives
        }
        if (relatedQueryKeys) {
          const clearKeys = Array.isArray(relatedQueryKeys) ? relatedQueryKeys : [relatedQueryKeys];
          setTimeout(() => {
            // Separate wildcard patterns from exact keys
            const wildcardPatterns = clearKeys
              .filter((key) => key.endsWith("*"))
              .map((key) => key.slice(0, -1));
            const exactKeys = clearKeys.filter((key) => !key.endsWith("*"));

            // Use single predicate call for all wildcard patterns
            if (wildcardPatterns.length > 0) {
              queryClient.invalidateQueries({
                predicate: (query) => {
                  if (!query.queryKey || !query.queryKey[0]) return false;
                  const queryKeyStr = String(query.queryKey[0]);
                  return wildcardPatterns.some((pattern) => queryKeyStr.startsWith(pattern));
                },
              });
            }

            // Handle exact keys
            exactKeys.forEach((key) => {
              queryClient.invalidateQueries({ queryKey: [key] });
            });
          }, 1000);
        }
        return response.data;
      }
    },
    staleTime: staleTime,
    refetchOnWindowFocus: refetchOnWindowFocus,
    refetchOnMount: refetchOnMount,
    refetchOnReconnect: refetchOnReconnect,
    keepPreviousData: keepPreviousData,
    refetchInterval: refetchInterval,
    retry: retryFn,
  });
  return queryInfo;
}

export function ApiPostCall({ relatedQueryKeys, onResult }) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (props) => {
      const { url, data, bulkRequest } = props;
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
        const clearKeys = Array.isArray(relatedQueryKeys) ? relatedQueryKeys : [relatedQueryKeys];
        setTimeout(() => {
          if (relatedQueryKeys === "*") {
            console.log("Invalidating all queries");
            queryClient.invalidateQueries();
          } else {
            // Separate wildcard patterns from exact keys
            const wildcardPatterns = clearKeys
              .filter((key) => key.endsWith("*"))
              .map((key) => key.slice(0, -1));
            const exactKeys = clearKeys.filter((key) => !key.endsWith("*"));

            // Use single predicate call for all wildcard patterns
            if (wildcardPatterns.length > 0) {
              queryClient.invalidateQueries({
                predicate: (query) => {
                  if (!query.queryKey || !query.queryKey[0]) return false;
                  const queryKeyStr = String(query.queryKey[0]);
                  const matches = wildcardPatterns.some((pattern) =>
                    queryKeyStr.startsWith(pattern)
                  );

                  // Debug logging for each query check
                  if (matches) {
                    console.log("Invalidating query:", {
                      queryKey: query.queryKey,
                      queryKeyStr,
                      matchedPattern: wildcardPatterns.find((pattern) =>
                        queryKeyStr.startsWith(pattern)
                      ),
                    });
                  }

                  return matches;
                },
              });
            }

            // Handle exact keys
            exactKeys.forEach((key) => {
              queryClient.invalidateQueries({ queryKey: [key] });
            });
          }
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
      if (
        data?.noPagination ||
        data?.manualPagination === false ||
        data?.tenantFilter === "AllTenants"
      ) {
        return undefined;
      }
      return lastPage?.Metadata?.nextLink ? { nextLink: lastPage.Metadata.nextLink } : undefined;
    },
    staleTime: 300000,
    refetchOnWindowFocus: false,
    retry: retryFn,
  });

  return queryInfo;
}
