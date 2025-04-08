import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BellRing, Check } from "lucide-react";

export const Default = () => {
  return (
    <Card className="w-[380px]">
      <CardHeader>
        <CardTitle>Default Card Title</CardTitle>
        <CardDescription>This is the card description.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is the main content area of the card. It can contain any elements needed.</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Deploy</Button>
      </CardFooter>
    </Card>
  );
};

Default.storyName = 'Default Card';

export const WithNotifications = () => {
  const notifications = [
    { title: "Your call has been confirmed.", description: "1 hour ago" },
    { title: "You have a new message!", description: "1 hour ago" },
    { title: "Your subscription is expiring soon!", description: "2 hours ago" },
  ];

  return (
    <Card className="w-[380px]">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>You have {notifications.length} unread messages.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className=" flex items-center space-x-4 rounded-md border p-4">
          <BellRing />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">
              Push Notifications
            </p>
            <p className="text-sm text-muted-foreground">
              Send notifications to device.
            </p>
          </div>
          {/* Add Switch component here if available */}
          <div className="w-10 h-6 bg-gray-300 rounded-full p-1 flex items-center">
             <div className="w-4 h-4 bg-white rounded-full shadow-md transform translate-x-4"></div> {/* Mock Switch */}
          </div>
        </div>
        <div>
          {notifications.map((notification, index) => (
            <div
              key={index}
              className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
            >
              <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {notification.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {notification.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">
          <Check className="mr-2 h-4 w-4" /> Mark all as read
        </Button>
      </CardFooter>
    </Card>
  );
};

WithNotifications.storyName = 'Card with Notifications Example';


export default {
  title: 'UI Primitives/Card (shadcn)',
};
