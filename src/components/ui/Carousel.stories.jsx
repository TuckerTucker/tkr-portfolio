import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './carousel';
import { Card, CardContent } from './card';

export default {
  title: 'UI/Carousel',
  component: Carousel,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Flexible carousel component built on Embla Carousel with navigation controls and keyboard support.',
      },
    },
  },
  argTypes: {
    orientation: {
      control: { type: 'select' },
      options: ['horizontal', 'vertical'],
      description: 'Carousel orientation',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

// Basic horizontal carousel
export const Default = () => (
  <div className="w-full max-w-xs mx-auto">
    <Carousel className="w-full max-w-xs">
      <CarouselContent>
        {Array.from({ length: 5 }).map((_, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <span className="text-4xl font-semibold">{index + 1}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  </div>
);

// Vertical carousel
export const Vertical = () => (
  <div className="w-full max-w-xs mx-auto">
    <Carousel orientation="vertical" className="w-full max-w-xs">
      <CarouselContent className="-mt-1 h-[200px]">
        {Array.from({ length: 5 }).map((_, index) => (
          <CarouselItem key={index} className="pt-1 md:basis-1/3">
            <div className="p-1">
              <Card>
                <CardContent className="flex items-center justify-center p-6">
                  <span className="text-3xl font-semibold">{index + 1}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  </div>
);

// Multiple items visible
export const MultipleItems = () => (
  <div className="w-full max-w-sm mx-auto">
    <Carousel className="w-full max-w-sm">
      <CarouselContent className="-ml-1">
        {Array.from({ length: 8 }).map((_, index) => (
          <CarouselItem key={index} className="pl-1 md:basis-1/2 lg:basis-1/3">
            <div className="p-1">
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <span className="text-2xl font-semibold">{index + 1}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  </div>
);

// Image carousel
export const ImageCarousel = () => (
  <div className="w-full max-w-xs mx-auto">
    <Carousel className="w-full max-w-xs">
      <CarouselContent>
        {[
          'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=300&h=200&fit=crop',
          'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=200&fit=crop',
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop',
          'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=200&fit=crop',
        ].map((src, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card>
                <CardContent className="p-0">
                  <img
                    src={src}
                    alt={`Slide ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  </div>
);

// Content carousel
export const ContentCarousel = () => (
  <div className="w-full max-w-lg mx-auto">
    <Carousel className="w-full max-w-lg">
      <CarouselContent>
        {[
          {
            title: 'Welcome',
            description: 'Get started with our amazing product',
            color: 'bg-blue-500',
          },
          {
            title: 'Features',
            description: 'Discover all the powerful features available',
            color: 'bg-green-500',
          },
          {
            title: 'Pricing',
            description: 'Choose the plan that fits your needs',
            color: 'bg-purple-500',
          },
          {
            title: 'Support',
            description: 'We\'re here to help you succeed',
            color: 'bg-orange-500',
          },
        ].map((item, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card>
                <CardContent className={`flex flex-col items-center justify-center p-8 text-white ${item.color} rounded-lg`}>
                  <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                  <p className="text-center">{item.description}</p>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  </div>
);

// Testimonials carousel
export const TestimonialsCarousel = () => (
  <div className="w-full max-w-md mx-auto">
    <Carousel className="w-full max-w-md">
      <CarouselContent>
        {[
          {
            quote: "This product has completely transformed how we work. Highly recommended!",
            author: "Sarah Johnson",
            role: "Product Manager",
          },
          {
            quote: "Incredible user experience and powerful features. Love it!",
            author: "Mike Chen",
            role: "Developer",
          },
          {
            quote: "The customer support is outstanding. They really care about their users.",
            author: "Emily Davis",
            role: "Designer",
          },
        ].map((testimonial, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card>
                <CardContent className="p-6">
                  <blockquote className="text-sm text-center mb-4">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="text-center">
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  </div>
);

// Auto-play carousel (simulated)
export const AutoPlayDemo = () => (
  <div className="w-full max-w-xs mx-auto">
    <Carousel
      className="w-full max-w-xs"
      opts={{
        align: "start",
        loop: true,
      }}
    >
      <CarouselContent>
        {Array.from({ length: 4 }).map((_, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <div className="text-center">
                    <div className="text-3xl font-semibold mb-2">{index + 1}</div>
                    <div className="text-sm text-muted-foreground">Auto-loop enabled</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  </div>
);

// No navigation controls
export const NoControls = () => (
  <div className="w-full max-w-xs mx-auto">
    <Carousel className="w-full max-w-xs">
      <CarouselContent>
        {Array.from({ length: 3 }).map((_, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <div className="text-center">
                    <span className="text-4xl font-semibold">{index + 1}</span>
                    <div className="text-xs text-muted-foreground mt-2">Swipe to navigate</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  </div>
);