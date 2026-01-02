import { cloneElement, useEffect, useMemo, useState } from "react";
import { useBoolean, useDebounceCallback } from "usehooks-ts";

import type { PopProps, PopTriggerProps } from "./types";
import { Paper, Popper } from "@mui/material";

function Pop ({ trigger, content, slotProps }: PopProps) {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const triggerHover = useBoolean(false);
    const popperHover = useBoolean(false);
    const popOpen = useBoolean(false);

    const processedTrigger = useMemo(() => {
        const injectedProps: PopTriggerProps = {
            ref: (node: HTMLElement | null) => {
                const { ref } = trigger.props;
                if (typeof ref === "function") {
                    ref(node);
                } else if (ref) {
                    ref.current = node;
                }

                if (node) setAnchorEl(node);
            },
            onMouseEnter: (event) => {
                trigger.props.onMouseEnter?.(event);
                triggerHover.setTrue();
            },
            onMouseLeave: (event) => {
                trigger.props.onMouseLeave?.(event);
                triggerHover.setFalse();
            }
        };

        return cloneElement(trigger, injectedProps);
    }, [trigger]);

    const handleHovers = useDebounceCallback((isTriggerHovered, isPopperHovered ) => popOpen.setValue(isTriggerHovered || isPopperHovered), 200);

    useEffect(() => handleHovers(triggerHover.value, popperHover.value), [triggerHover.value, popperHover.value]);

    return (
        <>
            {processedTrigger}
            <Popper
                {...slotProps?.muiPopper}
                open={slotProps?.muiPopper?.open || popOpen.value}
                anchorEl={anchorEl}
                onMouseEnter={popperHover.setTrue}
                onMouseLeave={popperHover.setFalse}
            >
                <Paper
                    {...slotProps?.muiPaper}
                    sx={{
                        padding: "8px",
                        ...slotProps?.muiPaper?.sx,
                    }}
                >
                    {content}
                </Paper>
            </Popper>
        </>
    )
}

export default Pop;
