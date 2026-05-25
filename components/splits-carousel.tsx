"use client"

import { useState } from "react"
import { AnimatePresence, motion, type PanInfo } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { SplitDonutChart, type SplitItem } from "@/components/split-donut-chart"

interface Slide {
  id: "network" | "currency"
  title: string
  description: string
  data: SplitItem[]
}

interface SplitsCarouselProps {
  slides: Slide[]
}

const SWIPE_CONFIDENCE_THRESHOLD = 8000
const swipePower = (offset: number, velocity: number) =>
  Math.abs(offset) * velocity

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
    scale: 0.97,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
    scale: 0.97,
  }),
}

export function SplitsCarousel({ slides }: SplitsCarouselProps) {
  const [[index, direction], setState] = useState<[number, number]>([0, 0])
  const slideCount = slides.length
  const current = slides[((index % slideCount) + slideCount) % slideCount]

  const paginate = (newDirection: number) => {
    setState(([prev]) => {
      const next = (((prev + newDirection) % slideCount) + slideCount) % slideCount
      return [next, newDirection]
    })
  }

  const goTo = (target: number) => {
    if (target === index) return
    setState([target, target > index ? 1 : -1])
  }

  const handleDragEnd = (
    _e: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const swipe = swipePower(info.offset.x, info.velocity.x)
    if (swipe < -SWIPE_CONFIDENCE_THRESHOLD || info.offset.x < -80) {
      paginate(1)
    } else if (swipe > SWIPE_CONFIDENCE_THRESHOLD || info.offset.x > 80) {
      paginate(-1)
    }
  }

  return (
    <div className="gemrails-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="inline-flex rounded-full border border-border bg-card/60 p-1">
            {slides.map((s, i) => {
              const active = i === index
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => goTo(i)}
                  className={`relative rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="splitsCarouselTab"
                      className="absolute inset-0 rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative">{s.title}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => paginate(-1)}
            aria-label="Previous"
            className="rounded-full border border-border bg-card/60 p-1.5 text-muted-foreground transition-colors hover:bg-emerald-500/10 hover:text-emerald-400"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => paginate(1)}
            aria-label="Next"
            className="rounded-full border border-border bg-card/60 p-1.5 text-muted-foreground transition-colors hover:bg-emerald-500/10 hover:text-emerald-400"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 min-h-[28px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${current.id}-header`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-sm text-muted-foreground">{current.description}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative mt-4 overflow-hidden">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={current.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 280, damping: 28 },
              opacity: { duration: 0.2 },
              scale: { duration: 0.25 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            onDragEnd={handleDragEnd}
            className="touch-pan-y"
          >
            <SplitDonutChart data={current.data} variant={current.id} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-5 flex items-center justify-center gap-2">
        {slides.map((s, i) => {
          const active = i === index
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show ${s.title}`}
              className="group flex h-3 items-center justify-center"
            >
              <span
                className={`block rounded-full transition-all duration-300 ${
                  active
                    ? "h-1.5 w-6 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]"
                    : "h-1.5 w-1.5 bg-gray-600 group-hover:bg-gray-400"
                }`}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
