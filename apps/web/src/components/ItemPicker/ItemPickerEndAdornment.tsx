import { useCallback, useEffect, useRef, useState } from "react";
import { useBoolean, useDebounceCallback } from "usehooks-ts";
import { CloseRounded, ArrowDropUpOutlined, ArrowDropDownOutlined } from "@mui/icons-material";
import { Chip, IconButton, Popper, Stack } from "@mui/material";

import { type ItemPickerEndAdornmentProps } from "./types";
import ItemPickerChip from "./ItemPickerChip";

function ItemPickerEndAdornment<Option>({
	hiddenPickedOptions,
	clearable,
	isListOpened,
	onClear,
	onDelete,
}: ItemPickerEndAdornmentProps<Option>) {
	const moreChipRef = useRef<HTMLDivElement>(null);
	const { value: isMoreChipHovered, setTrue: onIsMoreChipHovered, setFalse: offIsMoreChipHovered } = useBoolean(false);
	const { value: isMorePopperHovered, setTrue: onIsMorePopperHovered, setFalse: offIsMorePopperHovered } = useBoolean(false);

	const [isMorePopperOpened, setMorePopperOpened] = useState(false);
	const handleMoreComponentsHovers = useDebounceCallback(
		() => setMorePopperOpened(isMoreChipHovered || isMorePopperHovered),
		50,
	);
	useEffect(handleMoreComponentsHovers, [isMoreChipHovered, isMorePopperHovered]);

	return (
		<Stack direction="row" marginLeft="auto" alignItems="center">
			{Boolean(hiddenPickedOptions.length) && (
				<>
					<Chip
						ref={moreChipRef}
						onClick={e => e.stopPropagation()}
						label={`+${hiddenPickedOptions.length}`}
						onMouseEnter={onIsMoreChipHovered}
						onMouseLeave={offIsMoreChipHovered}
					/>

					<Popper anchorEl={moreChipRef.current} open={isMorePopperOpened}>
						<Stack
							direction="row"
							onMouseEnter={onIsMorePopperHovered}
							onMouseLeave={offIsMorePopperHovered}
							sx={theme => ({
								padding: "8px",
								maxWidth: "400px",
								flexWrap: "wrap",
								border: `1px solid ${theme.palette.divider}`,
								backgroundColor: theme.palette.background.default,
								borderRadius: "8px",
								boxShadow: "rgba(0, 0, 0, 0.25) 0px 4px 16px 0px",
								gap: 1,
							})}
						>
							{hiddenPickedOptions.map(unifiedOption => (
								<ItemPickerChip key={unifiedOption.value} ignoreIntersection {...{ unifiedOption, onDelete }} />
							))}
						</Stack>
					</Popper>
				</>
			)}
			{clearable && (
				<IconButton size="small" onClick={onClear}>
					<CloseRounded />
				</IconButton>
			)}
			{isListOpened ? <ArrowDropUpOutlined /> : <ArrowDropDownOutlined />}
		</Stack>
	);
}

export default ItemPickerEndAdornment;
