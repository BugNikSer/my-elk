import { useMemo, type ComponentProps, type MouseEvent } from "react";
import { ListItemText, MenuItem, useTheme } from "@mui/material";
import type { ItemPickerOptionValue, ItemPickerListOptionProps } from "./types";

function ItemListOption<Option>({
	unifiedOption,
	pickerValue,
	onClick,
	renderOption,
	slotProps,
}: ItemPickerListOptionProps<Option>) {
	const { value } = unifiedOption;
	const theme = useTheme();

	const optionLabelComponent = useMemo(() => {
		if (renderOption) return renderOption(unifiedOption);
		const { label } = unifiedOption;
		return <ListItemText {...slotProps?.listItemText}>{label}</ListItemText>;
	}, [unifiedOption, renderOption]);

	const isSelected = useMemo(() => {
		if (Array.isArray(pickerValue)) {
			return (pickerValue as ItemPickerOptionValue[]).includes(value);
		}
		return pickerValue === value;
	}, [pickerValue, unifiedOption]);

	const menuItemProps: ComponentProps<typeof MenuItem> = useMemo(
		() => ({
			tabIndex: 0,
			...slotProps?.menuItem,
			selected: isSelected,
			onClick: (event: MouseEvent<HTMLLIElement, globalThis.MouseEvent>) => {
				slotProps?.menuItem?.onClick?.(event);
				onClick(value);
			},
			ellipsisText: true,
			onKeyDown: event => {
				slotProps?.menuItem?.onKeyDown?.(event);
				if (event.code === "Enter") onClick(value);
			},
			sx: {
				...slotProps?.menuItem?.sx,
				[`&:focus-visible`]: { color: theme.palette.primary.main },
			},
		}),
		[onClick, value, isSelected, slotProps?.menuItem],
	);

	return <MenuItem {...menuItemProps}>{optionLabelComponent}</MenuItem>;
}

export default ItemListOption;
