import type { KeyboardEventHandler } from "react";
import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { SearchOutlined } from "@mui/icons-material";
import { TextField, Popover, Stack, CircularProgress, Alert } from "@mui/material";

import type {
	ItemPickerHandleOptionClick,
	ItemPickerHandlePickedOptionVisible,
	ItemPickerOptionValue,
	ItemPickerProps,
	ItemPickerUnifiedOption,
	ItemPickerUnifiedOptionsDict,
} from "./types";
import ItemPickerListOption from "./ItemPickerListOption";
import { defaultFilterFunction, getField, getNewPickerValueOnOptionCLick } from "./utils";
import ItemPickerValueMultiple from "./ItemPickerValueMultiple";
import ItemPickerEndAdornment from "./ItemPickerEndAdornment";
import ItemPickerVirtualList from "./ItemPickerVirtualList";
import { useBoolean } from "usehooks-ts";

function ItemPicker<Option = string | number | Record<string, any>>({
	value: pickerValue,
	options: rawOptions,
	filterable,
	multiple,
	clearable,
	virtual,
	isLoading,
	externalError,
	virtualRowHeight,
	virtualListHeight,
	virtualListWidth,
	onChange,
	placeholder = "Select option",
	filterValue: externalFilterValue,
	setFilterValue: externalSetFilterValue,
	getLabel,
	getValue,
	renderOption,
	filterFunction,
	slots,
	slotProps,
}: ItemPickerProps<Option>) {
	const textFieldRef = useRef<HTMLDivElement | null>(null);
	const inputRef = useRef<HTMLElement | null>(null);

	const hiddenPickedValues = useRef(new Set<ItemPickerOptionValue>());
	const [hiddenPickedOptions, setHiddenPickedOptions] = useState<ItemPickerUnifiedOption<Option>[]>([]);

	const [unifiedOptionsDict, setUnifiedOptionsDict] = useState<ItemPickerUnifiedOptionsDict<Option>>({});
	useEffect(() => setUnifiedOptionsDict(prev => {
		const fromRawOptions = rawOptions.reduce((acc, option) => {
			if (typeof option === "object") {
				const optionValue = getField({ option, getter: getValue, defaultField: "value" });
				const optionLabel = getField({ option, getter: getLabel, defaultField: "label" });
				return {
					...acc,
					[optionValue]: {
						...option,
						value: optionValue,
						label: optionLabel,
					} as ItemPickerUnifiedOption<Option>,
				};
			}
			return {
				...(acc as ItemPickerUnifiedOptionsDict<Option>),
				[option as ItemPickerOptionValue]: {
					value: option as ItemPickerOptionValue,
					label: option as ItemPickerOptionValue,
				} as ItemPickerUnifiedOption<Option>,
			};
		}, {} as ItemPickerUnifiedOptionsDict<Option>);

		const valueArr = pickerValue === null ? [] : Array.isArray(pickerValue) ? pickerValue : [pickerValue];
		const fromValue = valueArr.reduce((acc, value) => {
			return { ...acc, [value]: prev[value]  }
		}, {} as ItemPickerUnifiedOptionsDict<Option>);

		return { ...fromRawOptions, ...fromValue };
	}), [rawOptions, getLabel, getValue]);

	useEffect(() => {
		setHiddenPickedOptions(
			Array.from(hiddenPickedValues.current).map(v => unifiedOptionsDict[v])
		);
	}, [JSON.stringify(unifiedOptionsDict), JSON.stringify(Array.from(hiddenPickedValues.current))]);

	const {
		value: isListOpened,
		setTrue: openList,
		setFalse: closeList,
	} = useBoolean(false);

	const [filterValue, setFilterValue] = useState(externalFilterValue ?? "");
	useEffect(() => {
		if (externalFilterValue !== undefined) setFilterValue(externalFilterValue);
	}, [externalFilterValue]);
	useEffect(() => {
		externalSetFilterValue?.(filterValue);
	}, [filterValue]);

	const filteredUnifiedOptions = useMemo(() => {
		if (!filterable || !filterValue || externalFilterValue !== undefined) return Object.values(unifiedOptionsDict);
		return Object.values(unifiedOptionsDict).filter(item =>
			(filterFunction || defaultFilterFunction)(item, filterValue),
		);
	}, [JSON.stringify(unifiedOptionsDict), filterValue]);

	const handleOptionClick: ItemPickerHandleOptionClick = optionValue => {
		onChange(
			getNewPickerValueOnOptionCLick({
				optionValue,
				pickerValue,
				multiple,
			}),
		);
	};

	const onClear = useCallback((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		event.stopPropagation();
		onChange(multiple ? [] : null);
	}, []);

	const handleVisible: ItemPickerHandlePickedOptionVisible = useCallback(({ value, isVisible }) => {
		if (isVisible) hiddenPickedValues.current.delete(value);
		else hiddenPickedValues.current.add(value);
	}, []);

	const pickedOptions = useMemo(() => {
		if (pickerValue === null) return [];

		if (Array.isArray(pickerValue)) return pickerValue.map(v => unifiedOptionsDict[v]);
		return [unifiedOptionsDict[pickerValue]];
	}, [pickerValue, unifiedOptionsDict, getValue]);

	const handleMainTextFieldKeyDown: KeyboardEventHandler<HTMLDivElement> = useCallback(event => {
		if (event.code === "Space") openList();
	}, []);

	const singleModeValue = useMemo(() => {
		if (multiple || pickedOptions.length === 0 || pickedOptions.length > 1) return "";
		return getField({
			option: pickedOptions[0] as unknown as NonNullable<Option>,
			getter: getLabel,
			defaultField: "label",
		});
	}, [multiple, pickedOptions, getLabel]);

	const OptionComponent = useMemo(
		() =>
			Object.values(filteredUnifiedOptions).map(unifiedOption => (
				<ItemPickerListOption
					key={JSON.stringify(unifiedOption)}
					unifiedOption={unifiedOption}
					pickerValue={pickerValue}
					onClick={handleOptionClick}
					renderOption={renderOption}
					slotProps={slotProps?.option}
				/>
			)),
		[filteredUnifiedOptions, pickerValue],
	);

	return (
		<>
			<TextField
				{...slotProps?.mainTextField}
				ref={textFieldRef}
				slotProps={{
					...slotProps?.mainTextField?.slotProps,
					input: {
						...slotProps?.mainTextField?.slotProps?.input,
						ref: inputRef,
						readOnly: true,
						placeholder,
						slotProps: {
							root: {
								sx: { padding: 0, paddingLeft: 1 },
							},
							input: {
								sx: {
									width: "fit-content",
									overflow: "hidden",
									padding: 0,
								},
							},
						},
						endAdornment: (
							<ItemPickerEndAdornment
								{...{
									hiddenPickedOptions,
									clearable,
									isListOpened,
									onClear,
									onDelete: handleOptionClick,
								}}
							/>
						),
						startAdornment: multiple ? (
							<ItemPickerValueMultiple
								{...{
									pickedOptions,
									getLabel,
									getValue,
									multiple,
									handleVisible,
									onDelete: handleOptionClick,
									openList,
								}}
							/>
						) : (
							<></>
						),
					},
				}}
				onKeyDown={event => {
					slotProps?.mainTextField?.onKeyDown?.(event);
					handleMainTextFieldKeyDown(event);
				}}
				onClick={event => {
					slotProps?.mainTextField?.onClick?.(event);
					event.stopPropagation();
					event.preventDefault();
					openList();
				}}
				value={singleModeValue}
			/>
			<Popover
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "left",
				}}
				{...slotProps?.popover}
				anchorEl={textFieldRef.current}
				open={isListOpened}
				onClose={(event, reason) => {
					slotProps?.popover?.onClose?.(event, reason);
					closeList();
				}}
			>
				{isLoading ? (
					<CircularProgress />
				) : externalError ? (
					<Alert severity="error">{externalError.message}</Alert>
				) : (
					<Stack direction="column" {...slotProps?.popoverContent}>
						{/* Paper header */}
						{slots?.popperHeader}

						{/* Filter text field */}
						{filterable && (
							<TextField
								size="small"
								{...slotProps?.filterTextField}
								autoFocus
								value={filterValue}
								onChange={event => {
									slotProps?.filterTextField?.onChange?.(event);
									setFilterValue(event.target.value);
								}}
								slotProps={{
									...slotProps?.filterTextField?.slotProps,
									input: {
										startAdornment: <SearchOutlined />,
										slotProps: {
											root: {
												sx: { padding: 0, paddingLeft: 1 },
											},
										},
										...slotProps?.filterTextField?.slotProps?.input,
									},
								}}
							/>
						)}

						{/* Paper subheader */}
						{slots?.popperSubheader}

						{/* Options */}
						{filteredUnifiedOptions.length === 0 ? (
							<Alert severity="info">Нет данных</Alert>
						) : virtual ? (
							<ItemPickerVirtualList
								rowHeight={virtualRowHeight}
								listHeight={virtualListHeight}
								listWidth={virtualListWidth}
							>
								{OptionComponent}
							</ItemPickerVirtualList>
						) : (
							<Stack direction="column">{OptionComponent}</Stack>
						)}

						{/* Paper footer */}
						{slots?.popperFooter}
					</Stack>
				)}
			</Popover>
		</>
	);
}

export default ItemPicker;
