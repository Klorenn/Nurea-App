"use client"

import React from 'react'
import { motion, type Variants } from 'framer-motion'
import { Star, Bookmark, Briefcase, Clock, DollarSign, MapPin, Video, Home, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { VerifiedBadge } from './verified-badge'
import { Avatar, AvatarImage, AvatarFallback } from './avatar'
import { Button } from './button'
import { Badge } from './badge'
import { useLanguage } from '@/contexts/language-context'
import Link from 'next/link'

export interface ProfileCardProps {
  id: string
  name: string
  specialty: string
  avatarUrl: string
  coverImageUrl?: string
  rating: number
  reviewsCount?: number
  duration?: string
  rate: string | number
  location?: string
  consultationType?: 'online' | 'in-person' | 'both'
  verified?: boolean
  isBookmarked?: boolean
  onBookmark?: () => void
  onGetInTouch?: () => void
  className?: string
  yearsExperience?: number
  languages?: string[]
  isOnline?: boolean
}

const StatItem = ({ 
  icon: Icon, 
  value, 
  label 
}: { 
  icon: React.ComponentType<{ className?: string }>
  value: string | number
  label: string 
}) => (
  <div className="flex flex-col items-center gap-1 text-center">
    <div className="flex items-center gap-1.5">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="font-semibold text-foreground">{value}</span>
    </div>
    <span className="text-xs text-muted-foreground">{label}</span>
  </div>
)

export const ProfileCard: React.FC<ProfileCardProps> = ({
  id,
  name,
  specialty,
  avatarUrl,
  coverImageUrl,
  rating,
  reviewsCount = 0,
  duration = "60 min",
  rate,
  location,
  consultationType = 'both',
  verified = false,
  isBookmarked = false,
  onBookmark,
  onGetInTouch,
  className,
  yearsExperience,
  languages,
  isOnline,
}) => {
  const { language } = useLanguage()
  const isSpanish = language === "es"

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
        staggerChildren: 0.1,
      } as any,
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  }

  const formatRate = (rate: string | number) => {
    if (typeof rate === 'number') {
      return `$${rate.toLocaleString()} CLP`
    }
    return rate
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className={cn(
        'relative w-full max-w-sm overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm',
        className
      )}
    >
      {/* Cover Image */}
      <motion.div variants={itemVariants} className="h-32 w-full relative">
        {coverImageUrl ? (
          <img 
            src={coverImageUrl} 
            alt={`${name}'s cover`} 
            className="h-full w-full object-cover" 
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/20 to-primary/5" />
        )}
        {isOnline && (
          <div className="absolute top-3 left-3 px-2.5 py-0.5 text-xs rounded-full bg-teal-500 text-white font-medium">
            {isSpanish ? "En Línea" : "Online"}
          </div>
        )}
      </motion.div>

      {/* Bookmark Button */}
      {onBookmark && (
        <motion.button
          variants={itemVariants}
          onClick={onBookmark}
          aria-label={isSpanish ? "Guardar en favoritos" : "Bookmark profile"}
          className="absolute top-3 right-3 z-10 rounded-full bg-background/50 p-2 backdrop-blur-sm transition-colors hover:bg-background/75"
        >
          <Bookmark className={cn('h-5 w-5 text-foreground', isBookmarked && 'fill-current text-yellow-500')} />
        </motion.button>
      )}

      <div className="relative p-6 pt-0">
        {/* Avatar */}
        <motion.div variants={itemVariants} className="relative -mt-12 flex justify-start items-end gap-2">
          <Avatar className="h-20 w-20 rounded-full border-4 border-card object-cover">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {name.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          {verified && (
            <div className="mb-2">
              <VerifiedBadge size="sm" showText={false} />
            </div>
          )}
        </motion.div>

        <div className="mt-4">
          {/* Name & Role */}
          <motion.div variants={itemVariants} className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                {name}
                {verified && <VerifiedBadge size="sm" showText={true} />}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {specialty}
              </p>
            </div>
          </motion.div>

          {/* Consultation Type & Location */}
          <motion.div variants={itemVariants} className="mt-3 flex items-center gap-3 flex-wrap">
            {consultationType === 'online' || consultationType === 'both' ? (
              <Badge variant="outline" className="text-xs">
                <Video className="h-3 w-3 mr-1" />
                {isSpanish ? "Online" : "Online"}
              </Badge>
            ) : null}
            {consultationType === 'in-person' || consultationType === 'both' ? (
              <Badge variant="outline" className="text-xs">
                <Home className="h-3 w-3 mr-1" />
                {isSpanish ? "Presencial" : "In-person"}
              </Badge>
            ) : null}
            {location && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{location}</span>
              </div>
            )}
          </motion.div>

          {/* Stats Section */}
          <motion.div
            variants={itemVariants}
            className="mt-6 grid grid-cols-3 items-center justify-items-center gap-4 rounded-lg bg-muted/50 p-3"
          >
            <StatItem 
              icon={Star} 
              value={rating.toFixed(1)} 
              label={`${reviewsCount} ${isSpanish ? "reseñas" : "reviews"}`} 
            />
            <div className="h-8 w-px bg-border" />
            <StatItem 
              icon={Clock} 
              value={duration} 
              label={isSpanish ? "duración" : "duration"} 
            />
            <div className="h-8 w-px bg-border" />
            <StatItem 
              icon={DollarSign} 
              value={formatRate(rate)} 
              label={isSpanish ? "precio" : "rate"} 
            />
          </motion.div>

          {/* Additional Info */}
          {(yearsExperience || languages) && (
            <motion.div variants={itemVariants} className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
              {yearsExperience && (
                <div className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  <span>{yearsExperience} {isSpanish ? "años" : "years"}</span>
                </div>
              )}
              {languages && languages.length > 0 && (
                <div className="flex items-center gap-1">
                  <span>{languages.join(', ')}</span>
                </div>
              )}
            </motion.div>
          )}

          {/* Action Button */}
          <motion.div variants={itemVariants} className="mt-6">
            {onGetInTouch ? (
              <Button
                onClick={onGetInTouch}
                className="w-full rounded-full bg-primary py-3 text-center font-semibold text-primary-foreground transition-transform active:scale-95 hover:bg-primary/90"
              >
                {isSpanish ? "Contactar" : "Get in touch"}
              </Button>
            ) : (
              <Button
                asChild
                className="w-full rounded-full bg-primary py-3 text-center font-semibold text-primary-foreground transition-transform active:scale-95 hover:bg-primary/90"
              >
                <Link href={`/professionals/${id}`}>
                  {isSpanish ? "Ver Perfil" : "View Profile"}
                </Link>
              </Button>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
