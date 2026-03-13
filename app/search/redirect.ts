import { redirect } from 'next/navigation'

export function redirectToExplore(searchParams: URLSearchParams) {
  const params = new URLSearchParams()
  
  // Mapear parámetros antiguos a nuevos
  const q = searchParams.get('q')
  if (q) params.set('q', q)
  
  const specialty = searchParams.get('specialty')
  if (specialty) params.set('specialty', specialty.toLowerCase().replace(/\s+/g, '-'))
  
  const location = searchParams.get('location')
  if (location) params.set('location', location)
  
  const consultationType = searchParams.get('consultationType')
  if (consultationType) params.set('modality', consultationType)
  
  const minPrice = searchParams.get('minPrice')
  if (minPrice) params.set('price_min', minPrice)
  
  const maxPrice = searchParams.get('maxPrice')
  if (maxPrice) params.set('price_max', maxPrice)
  
  const queryString = params.toString()
  const destination = queryString ? `/explore?${queryString}` : '/explore'
  
  redirect(destination)
}
