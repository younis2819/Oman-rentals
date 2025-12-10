export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <div className="app-layout-wrapper bg-gray-50 min-h-screen">
        {children}
      </div>
    </>
  )
}