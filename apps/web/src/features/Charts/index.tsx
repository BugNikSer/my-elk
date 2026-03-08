import { useState } from "react";
import { CategoryPicker } from "../Categories"

export default function Charts() {
    const [categoryId, setCategoryId] = useState<number | null>(null);
    return (
        <div>
            <h1>Welcome to MyELK</h1>
            <p>This is the charts page. Use the navigation to explore the app.</p>
            <CategoryPicker multiple categoryId={categoryId} setCategoryId={setCategoryId} />
        </div>
    );
}   