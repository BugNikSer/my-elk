import { useState, type Dispatch, type PropsWithChildren, type SetStateAction } from "react";
import { Button, Card, CardActions, CardContent, CardHeader, IconButton, Modal } from "@mui/material";
import { AddCircleOutlined, Close } from '@mui/icons-material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
};

export default function CreateEntityModal({
    open,
    setOpen,
    title,
    isLoading,
    onSubmit,
    children,
}: PropsWithChildren<{
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    title: string;
    isLoading: boolean;
    onSubmit: () => Promise<void>;
}>) {
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <>
            <IconButton color="primary" size="medium" onClick={handleOpen}>
                <AddCircleOutlined />
            </IconButton>

            <Modal
                open={open}
                closeAfterTransition
            >
                <Card sx={style}>
                    <CardHeader
                        title={title}
                        action={
                            <IconButton onClick={handleClose} size="large" disabled={isLoading}>
                                <Close />
                            </IconButton>
                        }
                        sx={{ pt: 1, pb: 0, pr: 2, pl: 2 }}
                    />
                    <CardContent>
                        {children}
                    </CardContent>
                    <CardActions sx={{ pt: 0, pb: 2, pr: 2, pl: 2 }}>
                        <Button
                            variant="contained"
                            onClick={onSubmit}
                            fullWidth
                            loading={isLoading}
                        >
                            Create
                        </Button>
                    </CardActions>
                </Card>
            </Modal>
        </>
    )
}