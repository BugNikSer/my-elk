export interface BaseTagConstructorParams {
    name: string;
    userId: number;
}

export interface TagConstructorParams extends BaseTagConstructorParams {}

export interface ProductConstructorParams extends BaseTagConstructorParams {
    defaultCategoryId?: number;
    defaultKindId?: number;
}

export interface PurchaseConstructorParams {
    userId: number;
    price: number;
    productId: number;
    categoryId: number;
    kindId: number;
    tagIds: number[];
    dateISO: string;
}
