import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import { menuTiers } from '@/data/menus';
import ScrollReveal from '@/components/home/ScrollReveal';
import { prefersReducedMotion } from '@/hooks/useSmoothScroll';

const FoodShowcase = () => {
  const reduced = prefersReducedMotion();

  return (
    <section className="section-padding overflow-hidden bg-background">
      <div className="container-luxury">
        <ScrollReveal x={-50} y={50} className="mb-14 text-center md:mb-20">
          <p className="mb-4 font-sans text-xs uppercase tracking-[0.4em] text-accent">The Collections</p>
          <h2 className="font-serif text-4xl text-foreground md:text-6xl">Crafted for altitude</h2>
          <p className="mx-auto mt-5 max-w-md font-sans text-muted-foreground">
            From continental breakfasts to caviar service — every menu is plated for the skies.
          </p>
        </ScrollReveal>
      </div>

      <ScrollReveal
        x={60}
        y={40}
        className="px-2"
      >
        <div
          style={
            {
              '--swiper-pagination-color': 'hsl(var(--accent))',
              '--swiper-pagination-bullet-inactive-color': 'hsl(var(--foreground))',
              '--swiper-pagination-bullet-inactive-opacity': '0.25',
            } as React.CSSProperties
          }
        >
          <Swiper
            modules={[EffectCoverflow, Pagination, Autoplay]}
            effect="coverflow"
            grabCursor
            centeredSlides
            loop
            slidesPerView={1.15}
            spaceBetween={24}
            coverflowEffect={{ rotate: 0, stretch: 0, depth: 180, modifier: 1.6, slideShadows: false }}
            autoplay={reduced ? false : { delay: 3200, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            breakpoints={{
              768: { slidesPerView: 1.8 },
              1024: { slidesPerView: 2.4 },
            }}
            className="!pb-16"
          >
            {menuTiers.map((tier) => (
              <SwiperSlide key={tier.id} className="max-w-2xl">
                <div className="group relative aspect-[4/5] overflow-hidden rounded-xl md:aspect-[16/10]">
                  <img
                    src={tier.image}
                    alt={tier.name}
                    className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 p-7 md:p-9">
                    <p className="mb-2 font-sans text-[11px] uppercase tracking-[0.3em] text-accent">{tier.subtitle}</p>
                    <div className="flex items-end justify-between gap-4">
                      <h3 className="font-serif text-2xl text-foreground md:text-3xl">{tier.name}</h3>
                      <span className="shrink-0 font-sans text-sm text-muted-foreground">
                        from €{tier.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </ScrollReveal>

      <div className="container-luxury mt-4 text-center">
        <a
          href="#locations"
          className="inline-flex items-center gap-3 font-sans text-sm uppercase tracking-[0.2em] text-accent transition-colors hover:text-foreground"
        >
          Select your departure to order
          <span className="h-px w-10 bg-accent" />
        </a>
      </div>
    </section>
  );
};

export default FoodShowcase;
