import { storageURL } from "../api/client";

export function productImageUrl(product) {
  const primary = product?.images?.find((img) => img.is_primary) ?? product?.images?.[0];
  if (!primary?.image_path) return null;
  return `${storageURL}/storage/${primary.image_path}`;
}
