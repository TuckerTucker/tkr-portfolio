import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from './card';
import { Button } from './button';
import { MoreHorizontal, Heart, Share, Bookmark, Star, User, Calendar, MapPin } from 'lucide-react';

export default {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Flexible card component with header, content, footer, and action sections.',
      },
    },
  },
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

// Basic card
export const Default = () => (
  <Card className="w-80">
    <CardHeader>
      <CardTitle>Card Title</CardTitle>
      <CardDescription>
        This is a description of the card content.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <p>This is the main content of the card. It can contain any type of content.</p>
    </CardContent>
    <CardFooter>
      <Button>Action</Button>
    </CardFooter>
  </Card>
);

// Card with action
export const WithAction = () => (
  <Card className="w-80">
    <CardHeader>
      <CardTitle>Project Update</CardTitle>
      <CardDescription>
        Latest changes to the project
      </CardDescription>
      <CardAction>
        <Button size="icon" variant="ghost">
          <MoreHorizontal />
        </Button>
      </CardAction>
    </CardHeader>
    <CardContent>
      <p>The project has been updated with new features and improvements.</p>
    </CardContent>
    <CardFooter className="justify-between">
      <div className="flex items-center gap-2">
        <Button size="icon" variant="ghost">
          <Heart className="size-4" />
        </Button>
        <Button size="icon" variant="ghost">
          <Share className="size-4" />
        </Button>
        <Button size="icon" variant="ghost">
          <Bookmark className="size-4" />
        </Button>
      </div>
      <Button size="sm">View Details</Button>
    </CardFooter>
  </Card>
);

// Product card example
export const ProductCard = () => (
  <Card className="w-80">
    <CardHeader>
      <CardTitle>Premium Subscription</CardTitle>
      <CardDescription>
        Access all features with unlimited usage
      </CardDescription>
      <CardAction>
        <div className="flex items-center gap-1">
          <Star className="size-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">4.8</span>
        </div>
      </CardAction>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="text-3xl font-bold">$29<span className="text-lg font-normal">/month</span></div>
        <ul className="space-y-2">
          <li className="flex items-center gap-2">
            <div className="size-2 bg-green-500 rounded-full"></div>
            Unlimited projects
          </li>
          <li className="flex items-center gap-2">
            <div className="size-2 bg-green-500 rounded-full"></div>
            Priority support
          </li>
          <li className="flex items-center gap-2">
            <div className="size-2 bg-green-500 rounded-full"></div>
            Advanced analytics
          </li>
        </ul>
      </div>
    </CardContent>
    <CardFooter>
      <Button className="w-full">Get Started</Button>
    </CardFooter>
  </Card>
);

// Profile card
export const ProfileCard = () => (
  <Card className="w-80">
    <CardHeader>
      <CardTitle className="flex items-center gap-3">
        <div className="size-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <User className="size-5 text-white" />
        </div>
        Sarah Wilson
      </CardTitle>
      <CardDescription>
        Senior Product Designer
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="size-4" />
          San Francisco, CA
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="size-4" />
          Joined March 2023
        </div>
        <p className="text-sm">
          Passionate about creating user-centered designs that solve real problems.
        </p>
      </div>
    </CardContent>
    <CardFooter className="gap-2">
      <Button variant="outline" className="flex-1">Message</Button>
      <Button className="flex-1">Follow</Button>
    </CardFooter>
  </Card>
);

// Statistics card
export const StatisticsCard = () => (
  <Card className="w-80">
    <CardHeader>
      <CardTitle>Monthly Analytics</CardTitle>
      <CardDescription>
        Performance metrics for the last 30 days
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">+23%</div>
          <div className="text-sm text-muted-foreground">Revenue</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">1,234</div>
          <div className="text-sm text-muted-foreground">New Users</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">89%</div>
          <div className="text-sm text-muted-foreground">Satisfaction</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">456</div>
          <div className="text-sm text-muted-foreground">Conversions</div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Multiple cards layout
export const CardGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
    <Card>
      <CardHeader>
        <CardTitle>Feature A</CardTitle>
        <CardDescription>Description for feature A</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Content for the first card.</p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Feature B</CardTitle>
        <CardDescription>Description for feature B</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Content for the second card.</p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Feature C</CardTitle>
        <CardDescription>Description for feature C</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Content for the third card.</p>
      </CardContent>
    </Card>
  </div>
);

// Interactive card
export const InteractiveCard = () => (
  <Card className="w-80 hover:shadow-md transition-shadow cursor-pointer">
    <CardHeader>
      <CardTitle>Interactive Card</CardTitle>
      <CardDescription>
        This card responds to hover interactions
      </CardDescription>
    </CardHeader>
    <CardContent>
      <p>Hover over this card to see the shadow effect change.</p>
    </CardContent>
    <CardFooter>
      <Button variant="outline">Learn More</Button>
    </CardFooter>
  </Card>
);

// Minimal card
export const MinimalCard = () => (
  <Card className="w-80">
    <CardContent>
      <h3 className="font-semibold mb-2">Simple Card</h3>
      <p>This is a minimal card with just content.</p>
    </CardContent>
  </Card>
);