import type { PaperProps, PopperProps } from "@mui/material";
import type { MouseEventHandler, ReactElement, Ref } from "react";

export interface PopTriggerProps {
    onMouseEnter?: MouseEventHandler<HTMLElement>;
    onMouseLeave?: MouseEventHandler<HTMLElement>;
    ref?: Ref<HTMLElement>;
}

export interface PopProps {
    trigger: ReactElement<PopTriggerProps>;
    content: ReactElement;
    // muiPopperProps?: PopperProps;
    slotProps?: {
        muiPopper?: Partial<PopperProps>,
        muiPaper?: PaperProps;
    }
}
