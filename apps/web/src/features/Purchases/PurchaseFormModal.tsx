import { useEffect, useMemo, useState } from "react";
import {
	Checkbox,
	ListItemText,
	MenuItem,
	Select,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import type { Purchase } from "@my-elk/expenses-service";
import { useQuery } from "@tanstack/react-query";

import { expensesTRPC, expensesTrpcClient } from "../../utils/trpc";
import EntityFormModal from "../../components/EntityFormModal";

export default function PurchaseFormModal({ entity }: { entity?: Purchase }) {
	const [isLoading, setIsLoading] = useState(false);
	const [open, setOpen] = useState(false);

	const [price, setPrice] = useState(entity?.price.toString() ?? "");
	const [productId, setProductId] = useState<number | null>(entity?.product?.id ?? null);
	const [categoryId, setCategoryId] = useState<number | null>(entity?.category?.id ?? null);
	const [kindId, setKindId] = useState<number | null>(entity?.kind?.id ?? null);
	const [tagIds, setTagIds] = useState<number[]>(() =>
		entity?.tags?.map((tag) => tag.id) ?? [],
	);
	const [dateInput, setDateInput] = useState<string>(() => {
		if (!entity?.date) {
			return new Date().toISOString().slice(0, 10);
		}
		const d = typeof entity.date === "string" ? new Date(entity.date) : entity.date;
		return d.toISOString().slice(0, 10);
	});

	const products = useQuery(
		expensesTRPC.products.getMany.queryOptions({
			pagination: { page: 1, pageSize: 100 },
		}),
	);

	const categories = useQuery(
		expensesTRPC.categories.getMany.queryOptions({
			pagination: { page: 1, pageSize: 100 },
		}),
	);

	const kinds = useQuery(
		expensesTRPC.kinds.getMany.queryOptions({
			pagination: { page: 1, pageSize: 100 },
		}),
	);

	const tags = useQuery(
		expensesTRPC.tags.getMany.queryOptions({
			pagination: { page: 1, pageSize: 100 },
		}),
	);

	useEffect(() => {
		if (!entity) return;
		setPrice(entity.price.toString());
		setProductId(entity.product?.id ?? null);
		setCategoryId(entity.category?.id ?? null);
		setKindId(entity.kind?.id ?? null);
		setTagIds(entity.tags?.map((tag) => tag.id) ?? []);

		if (entity.date) {
			const d = typeof entity.date === "string" ? new Date(entity.date) : entity.date;
			setDateInput(d.toISOString().slice(0, 10));
		}
	}, [entity]);

	const selectedTagsLabel = useMemo(() => {
		if (!tags.data?.data?.length || !tagIds.length) return "";
		const map = new Map(tags.data.data.map((tag) => [tag.id, tag.name]));
		return tagIds.map((id) => map.get(id)).filter(Boolean).join(", ");
	}, [tagIds, tags.data]);

	const onSubmit = async () => {
		setIsLoading(true);
		const body = {
			price: Number(price),
			productId: productId ?? 0,
			categoryId: categoryId ?? 0,
			kindId: kindId ?? 0,
			tagIds,
			dateISO: new Date(dateInput).toISOString(),
		};

		try {
			if (entity) {
				await expensesTrpcClient.purchases.update.mutate({
					...body,
					id: entity.id,
				});
			} else {
				await expensesTrpcClient.purchases.create.mutate(body);
			}
			setOpen(false);
		} catch (err) {
			console.error("Failed to submit purchase", err);
		} finally {
			setIsLoading(false);
		}
	};

	const handleTagToggle = (id: number) => {
		setTagIds((prev) =>
			prev.includes(id) ? prev.filter((tagId) => tagId !== id) : [...prev, id],
		);
	};

	return (
		<EntityFormModal
			open={open}
			setOpen={setOpen}
			title={entity ? "Edit Purchase" : "Create Purchase"}
			isLoading={isLoading}
			isEditMode={Boolean(entity)}
			onSubmit={onSubmit}
		>
			<Stack direction="column" spacing={2}>
				<TextField
					label="Price"
					type="number"
					value={price}
					onChange={(e) => setPrice(e.target.value)}
					fullWidth
				/>

				<Select
					value={productId ?? ""}
					size="small"
					fullWidth
					displayEmpty
					onChange={(event) => setProductId(Number(event.target.value) || null)}
				>
					<MenuItem value="">
						<em>Select product</em>
					</MenuItem>
					{products.data?.data.map((product) => (
						<MenuItem key={product.id} value={product.id}>
							{product.name}
						</MenuItem>
					))}
				</Select>

				<Select
					value={categoryId ?? ""}
					size="small"
					fullWidth
					displayEmpty
					onChange={(event) => setCategoryId(Number(event.target.value) || null)}
				>
					<MenuItem value="">
						<em>Select category</em>
					</MenuItem>
					{categories.data?.data.map((category) => (
						<MenuItem key={category.id} value={category.id}>
							{category.name}
						</MenuItem>
					))}
				</Select>

				<Select
					value={kindId ?? ""}
					size="small"
					fullWidth
					displayEmpty
					onChange={(event) => setKindId(Number(event.target.value) || null)}
				>
					<MenuItem value="">
						<em>Select kind</em>
					</MenuItem>
					{kinds.data?.data.map((kind) => (
						<MenuItem key={kind.id} value={kind.id}>
							{kind.name}
						</MenuItem>
					))}
				</Select>

				<Select
					multiple
					value={tagIds}
					size="small"
					fullWidth
					displayEmpty
					renderValue={() => selectedTagsLabel || "Select tags"}
				>
					{tags.data?.data.map((tag) => (
						<MenuItem
							key={tag.id}
							value={tag.id}
							onClick={() => handleTagToggle(tag.id)}
						>
							<Checkbox checked={tagIds.includes(tag.id)} />
							<ListItemText primary={tag.name} />
						</MenuItem>
					))}
				</Select>

				<Stack direction="column" spacing={0.5}>
					<Typography variant="caption">Date</Typography>
					<TextField
						type="date"
						value={dateInput}
						onChange={(e) => setDateInput(e.target.value)}
						fullWidth
					/>
				</Stack>
			</Stack>
		</EntityFormModal>
	);
}

