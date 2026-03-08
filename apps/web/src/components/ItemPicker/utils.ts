import type { ItemPickerFilterFunction, ItemPickerOptionValue, ItemPickerValue } from "./types";

export const getField = <Option, Result>({
	option,
	getter,
	defaultField,
}: {
	option: NonNullable<Option>;
	getter?: (option: Option) => Result;
	defaultField: "value" | "label";
}) => {
	if (getter) return getter(option);
	if (typeof option === "object") {
		if (!(defaultField in option)) {
			console.warn(
				`ItemPicker Error: no 'get${defaultField.charAt(0).toUpperCase() + defaultField.slice(1)}' provided, missing key '${defaultField}' in object 'option'`,
			);
			return "" as Result;
		}
		return (option as { [defaultField]: any })[defaultField] as Result;
	}
	return option as Result;
};

export const getNewPickerValueOnOptionCLick = ({
	optionValue,
	pickerValue,
	multiple,
}: {
	optionValue: ItemPickerOptionValue;
	pickerValue: ItemPickerValue;
	multiple?: boolean;
}) => {
	// ↓↓↓ Кейс multiple select ↓↓↓
	if (multiple) {
		if (pickerValue === null) {
			return [optionValue as string];
		}

		if (Array.isArray(pickerValue)) {
			if ((pickerValue as (typeof optionValue)[]).includes(optionValue)) {
				return pickerValue.filter(item => item !== optionValue) as ItemPickerValue;
			}
			return [...pickerValue, optionValue] as ItemPickerValue;
		}

		// если компонент в режиме multiple, но в value лежит единичное значение
		if (pickerValue === optionValue) return [] as ItemPickerValue;
		return [pickerValue, optionValue] as ItemPickerValue;
	}

	// ↓↓↓ Кейс single select ↓↓↓
	if (pickerValue === optionValue) return null as ItemPickerValue;
	return optionValue as ItemPickerValue;
};

export const defaultFilterFunction: ItemPickerFilterFunction<string> = ({ label, value }, filterValue) =>
	(label as string | undefined)?.includes(filterValue) || String(value)?.includes(filterValue);
