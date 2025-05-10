import { formatDate, formatTime } from "@/lib/utils"

interface RecentClicksProps {
  clicks: Array<{
    id: string
    timestamp: string
    ip: string
    userAgent: string
    referer: string
    link: {
      slug: string
      title: string
    }
  }>
}

export function RecentClicks({ clicks }: RecentClicksProps) {
  if (clicks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <p className="text-muted-foreground">No clicks recorded yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {clicks.map((click) => (
        <div key={click.id} className="flex">
          <div className="mr-4 flex flex-col items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border">
              <div className="h-2 w-2 rounded-full bg-primary" />
            </div>
            <div className="h-full w-px bg-border" />
          </div>
          <div className="grid gap-1">
            <p className="text-sm font-medium leading-none">{click.link.title}</p>
            <p className="text-sm text-muted-foreground">/{click.link.slug}</p>
            <div className="flex items-center pt-2 text-xs text-muted-foreground">
              <time dateTime={click.timestamp}>
                {formatDate(click.timestamp)} at {formatTime(click.timestamp)}
              </time>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
