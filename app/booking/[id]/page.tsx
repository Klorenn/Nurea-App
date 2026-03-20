import { redirect } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

// El flujo de reserva via /booking/[id] usaba Prisma (schema vacío → crash).
// El flujo activo está en /professionals/[id] con Supabase.
export default async function BookingPage({ params }: Props) {
  const { id } = await params
  redirect(`/professionals/${id}`)
}
