export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold tracking-tight">Edit log</h1>
      <p className="text-sm text-muted-foreground">id: {id}</p>
    </div>
  );
}
