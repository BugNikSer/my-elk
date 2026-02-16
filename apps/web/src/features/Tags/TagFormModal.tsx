import { useEffect, useState } from "react";
import { TextField } from "@mui/material";
import type { TagDTO } from "@my-elk/expenses-service";

import { expensesTrpcClient } from "../../utils/trpc";
import EntityFormModal from "../../components/EntityFormModal";

export default function TagFormModal({ entity }: { entity?: TagDTO }) {
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(entity?.name || "");
    
    useEffect(() => {
        if (!entity) return;
        setName(entity.name);
    }, [entity])

    const onSubmit = async () => {
        setIsLoading(true);
        if (entity) {
            await expensesTrpcClient.tags.update.mutate({ id: entity.id, name, purchases: entity.purchases || [] })
                .then(() => {
                    setOpen(false);
                })
                .catch(err => {
                    console.error("Failed to update tag", err);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else {
            await expensesTrpcClient.tags.create.mutate({ name })
                .then(() => {
                    setName("");
                    setOpen(false);
                })
                .catch(err => {
                    console.error("Failed to create tag", err);
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
            title={Boolean(entity) ? "Edit tag" : "Create tag"}
            isLoading={isLoading}
            isEditMode={Boolean(entity)}
            onSubmit={onSubmit}
        >
            <TextField value={name} onChange={e => setName(e.target.value)} label="Name" fullWidth />
        </EntityFormModal>
    )
}