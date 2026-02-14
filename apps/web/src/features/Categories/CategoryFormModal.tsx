import { useState } from "react";
import { TextField } from "@mui/material";
import type { Category } from "@my-elk/expenses-service";

import { expensesTrpcClient } from "../../utils/trpc";
import EntityFormModal from "../../components/EntityFormModal";

export default function CreateCategory({ category }: { category?: Category }) {
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(category?.name || "");

    const onSubmit = async () => {
        setIsLoading(true);
        if (category) {
            await expensesTrpcClient.categories.update.mutate({ id: category.id, name })
                .then(() => {
                    setName("");
                    setOpen(false);
                })
                .catch(err => {
                    console.error("Failed to update category", err);
                });
        } else {
            await expensesTrpcClient.categories.create.mutate({ name })
                .then(() => {
                    setName("");
                    setOpen(false);
                })
                .catch(err => {
                    console.error("Failed to create category", err);
                });
        }

        setIsLoading(false);
    };

    return (
        <EntityFormModal
            open={open}
            setOpen={setOpen}
            title={Boolean(category) ? "Edit Category" : "Create Category"}
            isLoading={isLoading}
            isEditMode={Boolean(category)}
            onSubmit={onSubmit}
        >
            <TextField value={name} onChange={e => setName(e.target.value)} label="Name" fullWidth />
        </EntityFormModal>
    )
}