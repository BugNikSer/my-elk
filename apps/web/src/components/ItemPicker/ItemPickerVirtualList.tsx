import { type ReactNode, useMemo, type ReactElement } from "react";
import { List } from "react-window";
import { Box } from "@mui/material";

import type { ItemPickerVirtualListProps } from "./types";

function ItemPickerVirtualList({
	rowHeight = 32,
	listWidth = 300,
	listHeight = 400,
	children,
	className,
}: ItemPickerVirtualListProps): ReactElement {
	const options = useMemo(() => (Array.isArray(children) ? (children as ReactNode[]) : [children]), [children]);

	return (
		<Box sx={{ width: "100%", height: listHeight }}>
			<List
				className={className}
				rowHeight={rowHeight}
				rowCount={options.length}
				rowProps={{ options }}
				style={{
					height: listHeight,
					width: listWidth,
				}}
				overscanCount={5}
				rowComponent={({ options, style, index }) => <div style={style}>{options[index]}</div>}
				tagName="div"
			/>
		</Box>
	);
}

export default ItemPickerVirtualList;
