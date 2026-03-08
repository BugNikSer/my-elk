import { useQuery } from "@tanstack/react-query";
import { useDebounceValue } from "usehooks-ts";
import { expensesTRPC } from "../../utils/trpc";
import ItemPicker from "../../components/ItemPicker/ItemPicker";
import { useMemo, useState } from "react";
import type { ItemPickerValue } from "../../components/ItemPicker/types";
import { Typography } from "@mui/material";

export default function CategoryPicker<
    Multiple extends boolean = false,
    Value extends ItemPickerValue = Multiple extends true ? number[] : (number | null),
>({
    categoryId,
    setCategoryId,
    multiple
}: {
    categoryId: Value;
    setCategoryId: (categoryId: Value) => void;
    multiple?: Multiple;
}) {
    const [filterValue, setFilterValue] = useState("");
    const [debouncedFilterValue] = useDebounceValue(filterValue, 300);
    const { data, error, isLoading } = useQuery(expensesTRPC.categories.getMany.queryOptions({ filter: { query: debouncedFilterValue } }));

    const popperFooter = useMemo(() => {
        if (!data) return undefined;
        const remaining = data.total - data.data.length;
        if (remaining <= 0) return undefined;
        return <Typography>+ {remaining}</Typography>;
    }, [data]);

    return (
        <ItemPicker
            multiple={multiple}
            filterable
            filterValue={filterValue}
            setFilterValue={setFilterValue}
            clearable
            options={data?.data ?? []}
            getLabel={option => option.name}
            getValue={option => option.id}
            value={categoryId}
            onChange={(value) => setCategoryId(value as Value)}
            isLoading={isLoading}
            externalError={error ? { code: error.data?.code || "", message: error.message } : undefined}
            placeholder="Select category"
            slots={{ popperFooter }}
        />
    )
}
