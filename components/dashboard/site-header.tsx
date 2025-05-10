import Link from "next/link"
import { Link2 } from "lucide-react"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between py-3">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <Link2 className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg">LinkByte</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
