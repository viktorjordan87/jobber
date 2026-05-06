export const Jobs = {
    FIBONACCI: 'fibonacci',
    LOAD_PRODUCTS: 'load-products',
} as const;

export type Jobs = (typeof Jobs)[keyof typeof Jobs];