"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { connectWallet, StellarWalletError } from "@/lib/services/stellarService"
import { toast } from "sonner"
import { Wallet, Coins, Loader2, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

const FRIENDBOT_URL = "https://friendbot.stellar.org"

function truncatePublicKey(publicKey: string, start = 4, end = 4): string {
  if (publicKey.length <= start + end) return publicKey
  return `${publicKey.slice(0, start)}...${publicKey.slice(-end)}`
}

export interface WalletConnectProps {
  /** Clase adicional para el contenedor (ej. para integrar en Navbar o dashboard). */
  className?: string
  /** Si es true, muestra el botón "Obtener Test XLM" cuando hay billetera conectada. Por defecto true (modo dev). */
  showFundButton?: boolean
}

export function WalletConnect({ className, showFundButton = true }: WalletConnectProps) {
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isFunding, setIsFunding] = useState(false)

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      const address = await connectWallet()
      setPublicKey(address)
      toast.success("Billetera conectada", {
        description: truncatePublicKey(address),
      })
    } catch (err) {
      if (err instanceof StellarWalletError) {
        if (err.code === "FREIGHTER_NOT_INSTALLED") {
          toast.error("Freighter no instalado", {
            description: "Instala la extensión Freighter para conectar tu billetera Stellar.",
          })
          return
        }
        if (err.code === "USER_REJECTED") {
          toast.error("Conexión cancelada", {
            description: "Rechazaste la conexión en Freighter. Puedes intentar de nuevo cuando quieras.",
          })
          return
        }
        if (err.code === "NOT_IN_BROWSER") {
          toast.error("No disponible", {
            description: "La conexión de billetera solo está disponible en el navegador.",
          })
          return
        }
      }
      const message = err instanceof Error ? err.message : String(err)
      toast.error("Error al conectar", {
        description: message,
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const handleFund = async () => {
    if (!publicKey) return
    setIsFunding(true)
    try {
      const res = await fetch(`${FRIENDBOT_URL}/?addr=${encodeURIComponent(publicKey)}`)
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg =
          typeof data?.detail === "string"
            ? data.detail
            : data?.error?.message ?? "Friendbot no pudo fondear la cuenta."
        toast.error("Error al obtener Test XLM", {
          description: msg,
        })
        return
      }
      toast.success("Cuenta fondeada", {
        description: "Se han acreditado 10,000 XLM de prueba en tu cuenta.",
      })
    } catch {
      toast.error("Error de red", {
        description: "No se pudo conectar con Friendbot. Comprueba tu conexión e inténtalo de nuevo.",
      })
    } finally {
      setIsFunding(false)
    }
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {publicKey ? (
        <>
          <div
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-sm"
            role="status"
            aria-label={`Billetera conectada: ${truncatePublicKey(publicKey)}`}
          >
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
            <span className="font-mono text-xs font-medium text-foreground">
              {truncatePublicKey(publicKey)}
            </span>
            <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-medium text-primary">
              Conectado
            </span>
          </div>
          {showFundButton && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-full text-xs"
              onClick={handleFund}
              disabled={isFunding}
              aria-label="Obtener XLM de prueba"
            >
              {isFunding ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  Cargando...
                </>
              ) : (
                <>
                  <Coins className="h-3.5 w-3.5" aria-hidden="true" />
                  Obtener Test XLM
                </>
              )}
            </Button>
          )}
        </>
      ) : (
        <Button
          variant="default"
          size="sm"
          className="gap-2 rounded-full"
          onClick={handleConnect}
          disabled={isConnecting}
          aria-label="Conectar billetera Stellar"
        >
          {isConnecting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Conectando...
            </>
          ) : (
            <>
              <Wallet className="h-4 w-4" aria-hidden="true" />
              Conectar Billetera
            </>
          )}
        </Button>
      )}
    </div>
  )
}
