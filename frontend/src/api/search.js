import api from "./axiosInstance.js";
import { useQuery } from "@tanstack/react-query";

export const getSearchResults = (params) => {
  console.log("Query Function Executing with Params:", params);
  
  return api.get("/search", { params }).then((res) => res.data);
};

export function useSearchResults(params) {
  console.log("in the api hook");
  return useQuery({
    queryKey: ["searchResults", params],
    queryFn: () => getSearchResults(params),
    keepPreviousData: true,
  });
}