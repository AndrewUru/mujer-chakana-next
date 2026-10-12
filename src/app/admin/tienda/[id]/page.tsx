import ProductEditor from "@/components/shop/admin/ProductEditor";
export default async function EditShopProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductEditor id={id} />;
}
