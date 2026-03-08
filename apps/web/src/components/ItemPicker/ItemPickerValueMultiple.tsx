import { useRef } from "react";
import { Box } from "@mui/material";

import type { ItemPickerValueMultipleProps } from "./types";
import ItemPickerChip from "./ItemPickerChip";

function ItemPickerValueMultiple<Option>({
	pickedOptions,
	handleVisible,
	onDelete,
	openList,
}: ItemPickerValueMultipleProps<Option>) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	return (
		<Box
			ref={containerRef}
			sx={{
				width: "fit-content",
				maxWidth: "100%",
				display: "-webkit-inline-box",
				WebkitLineClamp: 1,
				WebkitBoxOrient: "vertical",
				overflow: "hidden",
				wordBreak: "break-word",
			}}
			onClick={event => {
				event.stopPropagation();
				event.preventDefault();
				openList();
			}}
		>
			{pickedOptions.map(unifiedOption => (
				<ItemPickerChip
					key={unifiedOption.value}
					{...{ unifiedOption, handleVisible, onDelete, containerRef }}
				/>
			))}
		</Box>
	);
}

export default ItemPickerValueMultiple;
