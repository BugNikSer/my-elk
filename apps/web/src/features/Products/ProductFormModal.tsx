import { useEffect, useState } from "react";
import { Select, TextField } from "@mui/material";
import type { ProductDTO } from "@my-elk/expenses-service";

import { expensesTrpcClient } from "../../utils/trpc";
import EntityFormModal from "../../components/EntityFormModal";

export default function CategoryFormModal({ entity }: { entity?: ProductDTO }) {
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(entity?.name || "");
    const [defaultCategory, setDefaultCategory] = useState(entity?.defaultCategory?.id || null);
    const [defaultKind, setDefaultKind] = useState(entity?.defaultKind?.id || null);

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
                defaultCategory: defaultCategory || undefined,
                defaultKind: defaultKind || undefined,
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
            await expensesTrpcClient.products.create.mutate({ name })
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
            <TextField value={defaultCategory} onChange={e => setDefaultCategory(Number(e.target.value))} label="Default Kind" fullWidth />
            <TextField value={defaultKind} onChange={e => setDefaultKind(Number(e.target.value))} label="Default Kind" fullWidth />
            {/* <Select value={defaultCategory} onChange={e => setDefaultCategory(e.target.value)} label="Default Category" fullWidth /> */}
        </EntityFormModal>
    )
}