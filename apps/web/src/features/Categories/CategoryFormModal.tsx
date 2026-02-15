import { useState } from "react";
import { TextField } from "@mui/material";
import type { Category } from "@my-elk/expenses-service";

import { expensesTrpcClient } from "../../utils/trpc";
import EntityFormModal from "../../components/EntityFormModal";

export default function CreateCategory({ entity }: { entity?: Category }) {
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(entity?.name || "");

    const onSubmit = async () => {
        setIsLoading(true);
        if (entity) {
            await expensesTrpcClient.categories.update.mutate({ id: entity.id, name })
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
            await expensesTrpcClient.categories.create.mutate({ name })
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
        </EntityFormModal>
    )
}