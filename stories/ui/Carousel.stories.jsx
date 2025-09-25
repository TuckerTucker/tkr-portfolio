import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../../src/components/ui/carousel';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../src/components/ui/card';
import { Button } from '../../src/components/ui/button';
import { Star, Heart, ShoppingCart, User } from 'lucide-react';

export default {
  title: 'UI/Carousel',
  component: Carousel,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A carousel component built on Embla Carousel with navigation controls'
      }
    }
  },
  argTypes: {
    orientation: {
      control: { type: 'select' },
      options: ['horizontal', 'vertical']
    },
    opts: {
      control: { type: 'object' }
    }
  },
  tags: ['autodocs']
};

// Sample images for demonstrations
const sampleImages = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=400&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600&h=400&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1418065460487-3956c3043904?w=600&h=400&fit=crop&crop=center'
];

// Sample products for demonstrations
const sampleProducts = [
  {
    id: 1,
    title: 'Wireless Headphones',
    description: 'Premium noise-cancelling headphones with 30-hour battery life',
    price: '$299',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop'
  },
  {
    id: 2,
    title: 'Smart Watch',
    description: 'Advanced fitness tracking with heart rate monitoring',
    price: '$399',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop'
  },
  {
    id: 3,
    title: 'Laptop Stand',
    description: 'Ergonomic aluminum laptop stand with adjustable height',
    price: '$79',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop'
  },
  {
    id: 4,
    title: 'Mechanical Keyboard',
    description: 'RGB backlit mechanical keyboard with custom switches',
    price: '$159',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=300&fit=crop'
  },
  {
    id: 5,
    title: 'Wireless Mouse',
    description: 'Precision gaming mouse with customizable buttons',
    price: '$89',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=300&fit=crop'
  }
];

// Sample testimonials
const testimonials = [
  {
    id: 1,
    quote: "This product completely transformed how I work. The quality is outstanding and the customer service is exceptional.",
    author: "Sarah Johnson",
    role: "Product Manager",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: 2,
    quote: "I've been using this for months now and it never fails to impress. Highly recommend to anyone in the industry.",
    author: "Mike Chen",
    role: "Software Developer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: 3,
    quote: "The attention to detail is remarkable. It's clear that a lot of thought went into every aspect of the design.",
    author: "Emily Rodriguez",
    role: "UX Designer",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
  }
];

// Default story
export const Default = {
  render: () => (
    <div className="w-full max-w-sm mx-auto">
      <Carousel>
        <CarouselContent>
          {sampleImages.map((image, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                <Card>
                  <CardContent className="flex aspect-square items-center justify-center p-6">
                    <img
                      src={image}
                      alt={`Slide ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
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
  ),
};

// Custom content carousel with product cards
export const WithCustomContent = {
  render: () => (
    <div className="w-full max-w-4xl mx-auto">
      <Carousel opts={{ align: "start" }}>
        <CarouselContent>
          {sampleProducts.map((product) => (
            <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/3">
              <div className="p-1">
                <Card className="h-full">
                  <CardHeader>
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <CardTitle className="text-lg">{product.title}</CardTitle>
                    <CardDescription>{product.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-primary">{product.price}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-muted-foreground">{product.rating}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="gap-2">
                    <Button className="flex-1">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button variant="outline" size="icon">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
};

// Auto-playing carousel with loop
export const AutoPlay = {
  render: () => (
    <div className="w-full max-w-sm mx-auto">
      <Carousel
        opts={{
          loop: true,
          autoplay: true,
          autoplayDelay: 3000,
        }}
      >
        <CarouselContent>
          {sampleImages.map((image, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                <Card>
                  <CardContent className="flex aspect-square items-center justify-center p-6">
                    <img
                      src={image}
                      alt={`Auto slide ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
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
      <p className="text-center text-sm text-muted-foreground mt-4">
        Auto-playing carousel (3 second intervals)
      </p>
    </div>
  ),
};

// Vertical orientation carousel
export const Vertical = {
  render: () => (
    <div className="w-full max-w-xs mx-auto">
      <Carousel orientation="vertical" className="w-full max-w-xs">
        <CarouselContent className="-mt-1 h-[400px]">
          {testimonials.map((testimonial) => (
            <CarouselItem key={testimonial.id} className="pt-1">
              <div className="p-1">
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.author}
                      className="w-16 h-16 rounded-full mb-4"
                    />
                    <blockquote className="text-sm italic mb-4">
                      "{testimonial.quote}"
                    </blockquote>
                    <div>
                      <div className="font-semibold">{testimonial.author}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.role}</div>
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
  ),
};

// Multiple items visible at once
export const MultipleItems = {
  render: () => (
    <div className="w-full max-w-4xl mx-auto">
      <Carousel
        opts={{
          align: "start",
          dragFree: true,
        }}
      >
        <CarouselContent>
          {Array.from({ length: 8 }).map((_, index) => (
            <CarouselItem key={index} className="basis-1/3 md:basis-1/4 lg:basis-1/5">
              <div className="p-1">
                <Card>
                  <CardContent className="flex aspect-square items-center justify-center p-6">
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
      <p className="text-center text-sm text-muted-foreground mt-4">
        Multiple items visible with drag-free scrolling
      </p>
    </div>
  ),
};

// Navigation arrows only
export const NavigationOnly = {
  render: () => (
    <div className="w-full max-w-sm mx-auto">
      <Carousel>
        <CarouselContent>
          {sampleImages.slice(0, 3).map((image, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                <Card>
                  <CardContent className="flex aspect-square items-center justify-center p-6">
                    <img
                      src={image}
                      alt={`Navigation slide ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
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
      <p className="text-center text-sm text-muted-foreground mt-4">
        Navigation arrows only (no dots indicator)
      </p>
    </div>
  ),
};

// Dots indicator only (custom implementation)
export const DotsOnly = {
  render: () => {
    const [api, setApi] = React.useState();
    const [current, setCurrent] = React.useState(0);
    const [count, setCount] = React.useState(0);

    React.useEffect(() => {
      if (!api) return;

      setCount(api.scrollSnapList().length);
      setCurrent(api.selectedScrollSnap() + 1);

      api.on("select", () => {
        setCurrent(api.selectedScrollSnap() + 1);
      });
    }, [api]);

    return (
      <div className="w-full max-w-sm mx-auto space-y-4">
        <Carousel setApi={setApi}>
          <CarouselContent>
            {sampleImages.slice(0, 4).map((image, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <Card>
                    <CardContent className="flex aspect-square items-center justify-center p-6">
                      <img
                        src={image}
                        alt={`Dots slide ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        <div className="flex justify-center space-x-2">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                current === index + 1 ? 'bg-primary' : 'bg-muted'
              }`}
              onClick={() => api?.scrollTo(index)}
            />
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Dots indicator only (no arrow navigation)
        </p>
      </div>
    );
  },
};

// Responsive behavior demonstration
export const ResponsiveBehavior = {
  render: () => (
    <div className="w-full max-w-6xl mx-auto">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent>
          {sampleProducts.map((product) => (
            <CarouselItem key={product.id} className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
              <div className="p-1">
                <Card className="h-full">
                  <CardHeader>
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-lg mb-2"
                    />
                    <CardTitle className="text-base sm:text-lg">{product.title}</CardTitle>
                    <CardDescription className="text-xs sm:text-sm line-clamp-2">
                      {product.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-lg sm:text-xl font-bold text-primary">{product.price}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs sm:text-sm text-muted-foreground">{product.rating}</span>
                      </div>
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
      <div className="mt-4 p-4 bg-muted rounded-lg">
        <h4 className="font-semibold mb-2">Responsive Behavior:</h4>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>• Mobile: 1 item per view</li>
          <li>• Small screens: 2 items per view</li>
          <li>• Medium screens: 3 items per view</li>
          <li>• Large screens: 4 items per view</li>
        </ul>
      </div>
    </div>
  ),
};

// Playground story with all controls
export const Playground = {
  args: {
    orientation: 'horizontal',
    opts: {
      align: 'center',
      loop: false,
    },
  },
  render: (args) => (
    <div className="w-full max-w-sm mx-auto">
      <Carousel {...args}>
        <CarouselContent>
          {sampleImages.slice(0, 5).map((image, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                <Card>
                  <CardContent className="flex aspect-square items-center justify-center p-6">
                    <img
                      src={image}
                      alt={`Playground slide ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
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
  ),
};