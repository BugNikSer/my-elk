import { useQuery } from "@tanstack/react-query";
import type { OperationContext, TRPCClientError, TRPCProcedureOptions } from "@trpc/client";
import type { TRPCConnectionState } from "@trpc/client/unstable-internals";
import type { Unsubscribable } from "@trpc/server/observable";
import type { DefaultErrorShape, inferAsyncIterableYield } from "@trpc/server/unstable-core-do-not-import";
import type { TRPCQueryOptions } from "@trpc/tanstack-react-query";
import { useEffect, useState } from "react";

// Mock for not exported @trpc/client interface
interface TRPCSubscriptionObserver<TValue, TError> {
	onStarted: (opts: { context: OperationContext | undefined }) => void;
	onData: (value: inferAsyncIterableYield<TValue>) => void;
	onError: (err: TError) => void;
	onStopped: () => void;
	onComplete: () => void;
	onConnectionStateChange: (state: TRPCConnectionState<TError>) => void;
}

type QueryOptions<EntityType, FilterType, SortFields> = TRPCQueryOptions<{
	input: {
		filter?: FilterType | undefined;
		pagination?: {
			page: number;
			pageSize: number;
		} | undefined;
		sorting?: {
			field: SortFields;
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
}, { keyPrefix: false }>;

type Subscriber<EntityType> = (input: void, opts: Partial<TRPCSubscriptionObserver<AsyncIterable<{
	data: EntityType;
	id: string;
}, never, unknown>, TRPCClientError<{
	input: void;
	output: AsyncIterable<{
		data: EntityType;
		id: string;
	}, never, unknown>;
	errorShape: DefaultErrorShape;
	transformer: false;
}>>> & TRPCProcedureOptions) => Unsubscribable;

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

export const useTableState = <EntityType extends { id: number }, FilterType, SortFields>({
	initialFilter,
	queryOptions,
	onUpdateSubscriber,
	onCreateSubscriber,
}: {
	initialFilter?: FilterType;
	queryOptions: QueryOptions<EntityType, FilterType, SortFields>;
	onUpdateSubscriber: Subscriber<EntityType>;
	onCreateSubscriber: Subscriber<EntityType>;
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

	useEffect(() => {
		const onUpdateSubscription = onUpdateSubscriber(undefined, {
			onData({ data }) {
				console.log("Received on update subscription data:", data);
				setEntities((prev) => prev?.map((c) => c.id === data.id ? data : c) || null);
			},
			onError(err) {
				console.error(' On update subscription error:', err);
			},
		});

		const onCreateSubscription = onCreateSubscriber(undefined, {
			onData(event) {
				console.log("Received on create subscription data:", event);
				refetch();
			},
			onError(err) {
				console.error('On create subscription error:', err);
			},
		});

		return () => {
			onUpdateSubscription.unsubscribe();
			onCreateSubscription.unsubscribe();
		};
	}, []);

	return {
		page,
		setPage,
		pageSize,
		setPageSize,
		filter,
		setFilter,
		entities,
		setEntities,
		total,
		setTotal,
		error,
		isLoading,
		refetch,
	};
}
