export function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="gemrails-card max-w-2xl">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </div>
  )
}
