import { Product } from '@amplience/dc-integration-middleware';

export type { Product }

export function getProductVariant(product: Product) {
    const variant = product.variants?.[0];
    return variant;
}

export function getProductImage(product: Product) {
    const image = product.variants?.[0]?.images[0]?.url;
    return image;
}