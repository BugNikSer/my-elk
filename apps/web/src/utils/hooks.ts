import { useQuery } from "@tanstack/react-query";
import type { DefaultErrorShape } from "@trpc/server/unstable-core-do-not-import";
import type { TRPCQueryOptions } from "@trpc/tanstack-react-query";
import { useEffect, useState } from "react";

export const usePagination = () => {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(100);

    useEffect(() => setPage(1), [pageSize]);
    
    return {
        page,
        pageSize,
        setPage,
        setPageSize,
    }
};

export type UsePaginationState = ReturnType<typeof usePagination>;

export const useTableState = <EntityType, FilterType>({
    initialFilter,
    queryOptions,
}: {
    queryOptions: TRPCQueryOptions<{
        input: {
            filter?: FilterType | undefined;
            pagination?: {
                page: number;
                pageSize: number;
            } | undefined;
            sorting?: {
                field: keyof EntityType;
                order: "ASC" | "DESC";
            } | undefined;
        };
        output: {
            data: EntityType[];
            total: number;
        };
        transformer: false;
        errorShape: DefaultErrorShape;
        featureFlags: {
            keyPrefix: false;
        };
    }>;
    initialFilter?: FilterType;
}) => {
    const { page, pageSize, setPage, setPageSize } = usePagination();
    const [filter, setFilter] = useState(structuredClone(initialFilter) || {} as FilterType);
    
    const { data, error, isLoading, refetch } = useQuery(queryOptions({ pagination: { page, pageSize }, filter }));

    const [entities, setEntities] = useState<EntityType[] | null>(null);
    const [total, setTotal] = useState<number | null>(null);

    useEffect(() => {
		if (data) {
			setEntities(data.data);
			setTotal(data.total);
		}
		if (error) {
			setEntities(null);
			setTotal(null);
		}
	}, [data, error]);

    // TODO: onCreate onUpdate subscriptions

    return { page, pageSize, setPage, setPageSize, entities, setEntities, total, setTotal };
}
