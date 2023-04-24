import { useMemo } from "react";
import { initializeApollo } from "@utils/apollo-client";

export function useApollo(initialState) {
    const store = useMemo(() => initializeApollo(initialState), [initialState]);
    return store;
}
