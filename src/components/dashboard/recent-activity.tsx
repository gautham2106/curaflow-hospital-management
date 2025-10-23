import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const activities = [
    {
        name: "John Smith",
        avatar: "https://picsum.photos/seed/pat1/100/100",
        avatarHint: "person portrait",
        action: "checked in for their 9:30 AM appointment.",
        time: "5 minutes ago"
    },
    {
        name: "Dr. Ben Adams",
        avatar: "https://picsum.photos/seed/doc2/100/100",
        avatarHint: "doctor portrait",
        action: "started consultation with Maria Garcia.",
        time: "10 minutes ago"
    },
    {
        name: "New Patient Registration",
        avatar: "",
        avatarHint: "person portrait",
        action: "A new patient, Michael Brown, was registered.",
        time: "1 hour ago"
    },
    {
        name: "Sarah Lee",
        avatar: "https://picsum.photos/seed/pat4/100/100",
        avatarHint: "person portrait",
        action: "appointment was marked as 'Completed'.",
        time: "2 hours ago"
    },
    {
        name: "Dr. Olivia Chen",
        avatar: "https://picsum.photos/seed/doc3/100/100",
        avatarHint: "doctor portrait",
        action: "updated their schedule for next week.",
        time: "4 hours ago"
    }
]

export function RecentActivity() {
  return (
    <div className="space-y-6">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-start">
          <Avatar className="h-9 w-9">
            <AvatarImage src={activity.avatar} alt="Avatar" data-ai-hint={activity.avatarHint} />
            <AvatarFallback>{activity.name.substring(0,2)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm">
              <span className="font-medium">{activity.name}</span> {activity.action}
            </p>
            <p className="text-xs text-muted-foreground">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
