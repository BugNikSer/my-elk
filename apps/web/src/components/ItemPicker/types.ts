import type {
	ReactElement,
	RefObject,
	HTMLAttributes,
	PropsWithChildren,
	ReactNode,
	MouseEvent as ReactMouseEvent,
	ComponentProps,
} from "react";
import type { RowComponentProps } from "react-window";
import type { ListItemTextProps } from "@mui/material";
import type { ChipProps, MenuItemProps } from "@mui/material";
import type { TextField, Popover, Stack } from "@mui/material";

export type Flatten<T> = T extends any[] ? T[number] : T;

export type ItemPickerValue = string | number | string[] | number[] | null;
export type ItemPickerOptionValue = string | number;
export type ItemPickerUnifiedOption<Option> = Record<"value" | "label", ItemPickerOptionValue> &
	(Option extends object ? Omit<NonNullable<Option>, "label" | "value"> : {});
export type ItemPickerUnifiedOptionsDict<Option> = Record<ItemPickerOptionValue, ItemPickerUnifiedOption<Option>>;

export type ItemPickerGetOptionValue<Option> = (option: Option) => ItemPickerOptionValue;
export type ItemPickerGetOptionLabel<Option> = (option: Option) => string;
export type ItemPickerRenderOption<Option> = (option: ItemPickerUnifiedOption<Option>) => ReactElement;
export type ItemPickerFilterFunction<Option> = (item: ItemPickerUnifiedOption<Option>, filterValue: string) => boolean;

export type ItemPickerHandleOptionClick = (optionValue: ItemPickerOptionValue) => void;
export type ItemPickerHandleOptionChipDelete = (optionValue: ItemPickerOptionValue) => void;
export type ItemPickerHandlePickedOptionVisible = (params: {
	value: ItemPickerOptionValue;
	isVisible: boolean;
}) => void;

export interface ItemPickerChipProps<Option> {
	unifiedOption: ItemPickerUnifiedOption<Option>;
	onDelete: (value: ItemPickerOptionValue) => void;
	handleVisible?: ItemPickerHandlePickedOptionVisible;
	containerRef?: RefObject<HTMLElement | null>;
	slotProps?: {
		chip?: ChipProps;
	};
}

export interface ItemPickerListOptionSlotProps {
	menuItem?: MenuItemProps;
	listItemText?: ListItemTextProps;
}
export interface ItemPickerListOptionProps<Option> {
	unifiedOption: ItemPickerUnifiedOption<Option>;
	pickerValue: ItemPickerValue;
	onClick: ItemPickerHandleOptionClick;
	renderOption?: ItemPickerRenderOption<Option>;
	slotProps?: ItemPickerListOptionSlotProps;
}

export interface ItemPickerSlots {
	popperHeader?: ReactNode;
	popperSubheader?: ReactNode;
	popperFooter?: ReactNode;
}
export interface ItemPickerSlotProps {
	mainTextField?: Omit<ComponentProps<typeof TextField>, "value" | "ref">;
	popover?: Omit<ComponentProps<typeof Popover>, "open">;
	popoverContent?: ComponentProps<typeof Stack>;
	filterTextField?: Omit<ComponentProps<typeof TextField>, "value">;
	option?: ItemPickerListOptionSlotProps;
}

export interface ItemPickerProps<Option> {
	value: ItemPickerValue;
	options: NonNullable<Option>[];
	filterable?: boolean;
	multiple?: boolean;
	clearable?: boolean;
	virtual?: boolean;
	isLoading?: boolean;
	externalError?: { code: string; message: string };
	virtualRowHeight?: number;
	virtualListWidth?: number;
	virtualListHeight?: number;
	onChange: (value: ItemPickerValue) => void;
	placeholder?: string;
	filterValue?: string;
	setFilterValue?: (value: string) => void;
	renderOption?: ItemPickerRenderOption<Option>;
	getLabel?: ItemPickerGetOptionLabel<Option>;
	getValue?: ItemPickerGetOptionValue<Option>;
	filterFunction?: ItemPickerFilterFunction<Option>;
	slots?: ItemPickerSlots;
	slotProps?: ItemPickerSlotProps;
}

export interface ItemPickerValueMultipleProps<Option> {
	pickedOptions: ItemPickerUnifiedOption<Option>[];
	handleVisible: ItemPickerHandlePickedOptionVisible;
	onDelete: ItemPickerHandleOptionChipDelete;
	openList: () => void;
	slotProps?: {
		chip?: ChipProps;
	};
}

export interface ItemPickerEndAdornmentProps<Option> {
	hiddenPickedOptions: ItemPickerUnifiedOption<Option>[];
	clearable?: boolean;
	isListOpened: boolean;
	onClear: (event: ReactMouseEvent<HTMLButtonElement, MouseEvent>) => void;
	onDelete: ItemPickerHandleOptionChipDelete;
}

export type ItemPickerVirtualListProps = PropsWithChildren<
	HTMLAttributes<HTMLElement> & {
		rowHeight?: number;
		listWidth?: number;
		listHeight?: number;
	}
>;

export type RenderVirtualItemPickerItemProps = RowComponentProps & { options: ReactNode[] };
