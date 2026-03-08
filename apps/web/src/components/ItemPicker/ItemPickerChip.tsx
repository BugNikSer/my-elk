import { useCallback, useLayoutEffect } from "react";
import { Chip } from "@mui/material";
import { useIntersectionObserver } from "usehooks-ts";

import type { ItemPickerChipProps } from "./types";

function ItemPickerChip<Option>({
	unifiedOption: { value, label },
	onDelete,
	handleVisible,
	containerRef,
	slotProps,
}: ItemPickerChipProps<Option>) {
	const [ref, isVisible] = useIntersectionObserver({ threshold: 1, root: containerRef?.current });

	const onItemDelete = useCallback(() => onDelete(value), [onDelete, value]);

	useLayoutEffect(() => {
		handleVisible?.({ isVisible, value });
		return () => {
			handleVisible?.({ isVisible: true, value });
		};
	}, [isVisible, value]);

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
			sx={{
				...slotProps?.chip?.sx,
				ml: "4px",
				mb: "1px",
				height: "18px",
			}}
		/>
	);
}

export default ItemPickerChip;
