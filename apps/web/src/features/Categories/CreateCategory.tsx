import { useState } from "react";
import { TextField } from "@mui/material";
import CreateEntityModal from "../../components/CreateEntityModal";
import { expensesTrpcClient } from "../../utils/trpc";

export default function CreateCategory() {
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");

    const onSubmit = async () => {
        setIsLoading(true);
        await expensesTrpcClient.categories.create.mutate({ name })
            .then(() => {
                setName("");
                setOpen(false);
            })
            .catch(err => {
                console.error("Failed to create category", err);
            });
        setIsLoading(false);
    };

    return (
        <CreateEntityModal
            open={open}
            setOpen={setOpen}
            title="Create Category"
            isLoading={isLoading}
            onSubmit={onSubmit}
        >
            <TextField value={name} onChange={e => setName(e.target.value)} label="Name" fullWidth />
        </CreateEntityModal>
    )
}