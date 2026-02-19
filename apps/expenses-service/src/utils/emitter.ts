import { ProcedureResolverOptions, UnsetMarker } from '@trpc/server/unstable-core-do-not-import';
import EventEmitter, { on } from 'events';
import { tracked } from "@trpc/server";

import { TRPCContext } from '../trpc/context';
import { IncomingMessage, ServerResponse } from 'http';

export type EventMap<T> = Record<keyof T, any[]>;
export class IterableEventEmitter<T extends EventMap<T>> extends EventEmitter<T> {
	toIterable<TEventName extends keyof T & string>(
		eventName: TEventName,
		opts?: NonNullable<Parameters<typeof on>[2]>,
	): AsyncIterable<T[TEventName]> {
		return on(this as any, eventName, opts) as any;
	}
};

export interface MyEvents<Entity> {
	created: [data: Entity];
	updated: [data: Entity];
};

export async function* onEvent<Entity extends { userId: number; id: number }>({
	options,
	emitter,
	event,
}: {
	options: ProcedureResolverOptions<TRPCContext, object, {
		res: ServerResponse<IncomingMessage>;
		userId: number | null;
		accessToken: string | null;
		refreshToken: string | null;
	}, UnsetMarker>;
	emitter: IterableEventEmitter<MyEvents<Entity>>;
	event: keyof MyEvents<Entity>;
}) {
	const { ctx, signal } = options;
	const iterable = emitter.toIterable(event, { signal });

	function* maybeYield(category: Entity) {
		if (category.userId !== ctx.userId) return;
		yield tracked(String(category.id), category);
	}

	for await (const [category] of iterable) {
		yield* maybeYield(category);
	}
}
