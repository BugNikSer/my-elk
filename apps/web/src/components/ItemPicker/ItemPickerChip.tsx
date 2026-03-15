import { useCallback, useEffect } from "react";
import { Chip } from "@mui/material";
import { useIntersectionObserver } from "usehooks-ts";

import type { ItemPickerChipProps } from "./types";

function ItemPickerChip<Option>({
	unifiedOption: { value, label },
	onDelete,
	handleVisible,
	ignoreIntersection,
	containerRef,
	slotProps,
}: ItemPickerChipProps<Option>) {
	const [ref] = useIntersectionObserver({
		threshold: 1,
		root: containerRef?.current,
		onChange: (isIntersecting) => {
			if (!ignoreIntersection) handleVisible?.({ isVisible: isIntersecting, value });
		}
	});

	const onItemDelete = useCallback(() => onDelete(value), [onDelete, value]);

	useEffect(() => {
		return () => {
			if (!ignoreIntersection) handleVisible?.({ isVisible: true, value });
		};
	}, [ignoreIntersection]);

	return (
		<Chip
			// variant="outlined"
			{...slotProps?.chip}
			ref={ref}
			label={label}
			onDelete={event => {
				event.stopPropagation();
				event.preventDefault();
				onItemDelete();
			}}
			onClick={event => {
				event.stopPropagation();
				event.preventDefault();
			}}
			size="small"
			sx={{
				// mr: 0.5,
				...slotProps?.chip?.sx,
			}}
		/>
	);
}

export default ItemPickerChip;
