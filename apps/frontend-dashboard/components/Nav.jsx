import Link from 'next/link'

export default function Nav() {
  return (
    <nav className="nav">
      <div className="container flex justify-between items-center">
        <div className="font-bold">Staffless</div>
        <div className="space-x-4">
          <Link href="/">Overview</Link>
          <Link href="/conversations">Conversations</Link>
          <Link href="/leads">Leads</Link>
        </div>
      </div>
    </nav>
  )
}
