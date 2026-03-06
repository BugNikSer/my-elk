import { useEffect, useState } from "react";
import { MenuItem, Select, TextField, Typography } from "@mui/material";
import type { Product } from "@my-elk/expenses-service";

import { expensesTRPC, expensesTrpcClient } from "../../utils/trpc";
import EntityFormModal from "../../components/EntityFormModal";
import { useQuery } from "@tanstack/react-query";

export default function CategoryFormModal({ entity }: { entity?: Product }) {
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(entity?.name || "");
    const [defaultCategory, setDefaultCategory] = useState(entity?.defaultCategory?.id || null);
    const [defaultKind, setDefaultKind] = useState(entity?.defaultKind?.id || null);

    const categories = useQuery(expensesTRPC.categories.getMany.queryOptions({ pagination: { page: 1, pageSize: 20 } }));
    const kinds = useQuery(expensesTRPC.kinds.getMany.queryOptions({ pagination: { page: 1, pageSize: 20 } }));

    useEffect(() => {
        if (!entity) return;
        setName(entity.name);
        setDefaultCategory(entity.defaultCategory?.id || null);
        setDefaultKind(entity.defaultKind?.id || null);
    }, [entity])

    const onSubmit = async () => {
        setIsLoading(true);
        if (entity) {
            await expensesTrpcClient.products.update.mutate({
                id: entity.id,
                name,
                defaultCategoryId: defaultCategory || undefined,
                defaultKindId: defaultKind || undefined,
            })
                .then(() => {
                    setOpen(false);
                })
                .catch(err => {
                    console.error("Failed to update category", err);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else {
            await expensesTrpcClient.products.create.mutate({
                name,
                defaultCategoryId: defaultCategory || undefined,
                defaultKindId: defaultKind || undefined,
            })
                .then(() => {
                    setName("");
                    setOpen(false);
                })
                .catch(err => {
                    console.error("Failed to create category", err);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }

    };

    return (
        <EntityFormModal
            open={open}
            setOpen={setOpen}
            title={Boolean(entity) ? "Edit Category" : "Create Category"}
            isLoading={isLoading}
            isEditMode={Boolean(entity)}
            onSubmit={onSubmit}
        >
            <TextField value={name} onChange={e => setName(e.target.value)} label="Name" fullWidth />
            <Select value={defaultCategory} size="small" label="Default Category" fullWidth>
                {categories?.data?.data.map((category) => (
                    <MenuItem
                        key={category.id}
                        value={category.id}
                        onClick={() => setDefaultCategory(category.id)}
                    >{category.name}</MenuItem>
                ))}
            </Select>
            <Select value={defaultKind} size="small" label="Default Kind" fullWidth>
                {kinds?.data?.data.map((kind) => (
                    <MenuItem
                        key={kind.id}
                        value={kind.id}
                        onClick={() => setDefaultKind(kind.id)}
                    >{kind.name}</MenuItem>
                ))}
            </Select>
        </EntityFormModal>
    )
}