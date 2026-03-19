import { Metadata } from 'next'
import { ArrowRight, Code, Zap, Globe, Coins, ShieldBan, Smartphone, Activity, Box, CheckCircle2, XCircle } from 'lucide-react'
import { NureaHeader } from '@/components/ui/nurea-header'
import { PaperShaderBackground } from '@/components/ui/background-paper-shaders'
import { StackedCircularFooter } from '@/components/ui/stacked-circular-footer'

export const metadata: Metadata = {
  title: 'x402 en Stellar | NUREA',
  description: 'x402 es el protocolo abierto para pagos HTTP nativos impulsado por la red Stellar',
}

export default function X402Page() {
  return (
    <main className="min-h-screen relative bg-black text-slate-200 font-sans selection:bg-teal-500/30 selection:text-teal-200">
      <PaperShaderBackground />
      
      <div className="relative z-10">
        <NureaHeader />

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 ring-1 ring-inset ring-teal-500/20 mb-8 text-sm font-medium">
            <Globe className="h-4 w-4" />
            <span>Impulsado por Stellar y Soroban</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
            x402. Pagos Nativos<br className="hidden md:block"/> en Stellar.
          </h1>
          <p className="mt-6 text-xl leading-8 text-slate-400 max-w-3xl mx-auto text-balance">
            Resuelve el problema original de internet al posibilitar pagos entre clientes y servidores de forma nativa a través de smart contracts en Soroban. Crea economías que impulsan los pagos entre agentes IA a gran escala con tiempos de liquidación sub-segundos en Stellar.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a href="#how-it-works" className="rounded-full bg-teal-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 transition-all">
              Aprende cómo empezar
            </a>
            <a href="#docs" className="text-sm font-semibold leading-6 text-white group flex items-center gap-2">
              Ver documentación <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </section>

        {/* Code Snippet Section */}
        <section className="py-24 px-6 lg:px-8 max-w-5xl mx-auto">
          <div className="rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-white/10 p-4 md:p-8 flex flex-col md:flex-row gap-12 items-center shadow-2xl">
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl font-bold text-white tracking-tight">Acepta pagos con una sola línea de código.</h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                Eso es todo. Añade una línea de código para exigir el pago de cada solicitud entrante. Si una solicitud llega sin pago, el servidor responde con un código HTTP 402, solicitando al cliente que pague y vuelva a intentarlo.
              </p>
            </div>
            <div className="flex-1 w-full bg-slate-950 rounded-xl overflow-hidden border border-white/5 shadow-inner">
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-900 border-b border-white/5">
                <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                <span className="text-xs font-mono text-slate-500 ml-2">server.js</span>
              </div>
              <div className="p-4 text-sm font-mono text-teal-300 overflow-x-auto">
                <pre>
                  <code>
<span className="text-purple-400">app</span>.<span className="text-blue-400">use</span>(
  <span className="text-blue-400">paymentMiddleware</span>(
    &#123;
      <span className="text-amber-300">"GET /api/data"</span>: &#123;
        <span className="text-slate-300">accepts:</span> [<span className="text-amber-300">"stellar:testnet"</span>], <span className="text-slate-500">// OpenZeppelin Relayer</span>
        <span className="text-slate-300">description:</span> <span className="text-amber-300">"Soroban Auth Required"</span>,
      &#125;,
    &#125;,
  )
);
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Metrics Section */}
        <section className="py-20 border-y border-white/5 bg-slate-950/30">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
              {[
                { label: 'Actas', value: '75.41M', icon: Activity },
                { label: 'Volumen', value: '$24.24M', icon: Coins },
                { label: 'Compradores', value: '94.06K', icon: Smartphone },
                { label: 'Vendedores', value: '22K', icon: Box },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col items-center gap-2">
                  <stat.icon className="h-6 w-6 text-teal-500/70 mb-2" />
                  <span className="text-4xl md:text-5xl font-bold text-white tracking-tight">{stat.value}</span>
                  <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">{stat.label}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-slate-500 mt-8">Datos de los últimos 30 días</p>
          </div>
        </section>

        {/* What is x402 Features Section */}
        <section className="py-24 px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-6">¿Qué es x402?</h2>
            <p className="text-lg text-slate-400">
              Los pagos por internet presentan fallos fundamentales. Las tarjetas de crédito son engorrosas, difíciles de aceptar, tienen mínimos de pago excesivamente altos y no se adaptan a la naturaleza programática de internet. Es hora de un sistema de pagos abierto y nativo de internet sin comisiones ocultas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Nativo de HTTP',
                desc: 'Está integrado en Internet. El código x402 está integrado en las solicitudes HTTP existentes, sin necesidad de comunicación adicional.',
                icon: Globe
              },
              {
                title: 'Tarifas cero',
                desc: 'x402 es gratuito tanto para el cliente como para el comerciante; solo se pagan comisiones mínimas a la red de pagos.',
                icon: Coins
              },
              {
                title: 'Cero espera',
                desc: 'El dinero se mueve a la absoluta velocidad de internet, resolviendo liquidaciones al instante sin retrasos prolongados.',
                icon: Zap
              },
              {
                title: 'Fricción cero',
                desc: 'Los clientes pagan API requests con "signed auth entries" de Soroban. Sin KYC ni tarjetas de crédito.',
                icon: ShieldBan
              },
              {
                title: 'Centralización cero',
                desc: 'Cualquier persona en Internet puede desarrollar, auditar, o ampliar x402 sin guardianes corporativos.',
                icon: Box
              },
              {
                title: 'Restricciones cero',
                desc: 'x402 es un estándar neutral, completamente autónomo y no vinculado a ninguna red en específica.',
                icon: Code
              }
            ].map((feature) => (
              <div key={feature.title} className="bg-slate-900/40 border border-white/5 rounded-2xl p-8 hover:bg-slate-900/60 transition-colors">
                <div className="h-12 w-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-6">
                  <feature.icon className="h-6 w-6 text-teal-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-teal-900/10 backdrop-blur-3xl -z-10"></div>
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                Necesitamos una nueva forma de transferir valor.
              </h2>
              <p className="mt-6 text-lg text-slate-400">
                El antiguo sistema de pagos apenas funciona en un mundo humano, y mucho menos en un futuro con agentes propios. x402 logra en cuestión de segundos lo que los sistemas actuales son completamente incapaces de hacer.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
              {/* Old Way */}
              <div className="bg-slate-950/80 border border-rose-500/20 rounded-3xl p-8 md:p-10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                <h3 className="text-2xl font-bold text-white flex items-center gap-3 mb-8">
                  <XCircle className="h-6 w-6 text-rose-500" />
                  La forma antigua
                </h3>
                <ol className="space-y-6 relative border-l border-slate-800 ml-3">
                  {[
                    { title: 'Crear cuenta con un proveedor', desc: 'Configuración y formularios que requieren mucho tiempo.' },
                    { title: 'Agregar método de pago', desc: 'Se requiere KYC, lo que retrasa el acceso y exige aprobación.' },
                    { title: 'Compra créditos o suscripción', desc: 'Compromiso prepagado → pago excesivo o agotamiento de fondos.' },
                    { title: 'Gestionar la clave API', desc: 'Riesgo de seguridad → es necesario almacenar y rotar las claves.' },
                    { title: 'Realizar el pago final', desc: 'Transacciones lentas, altos contracargos y excesivas comisiones.' }
                  ].map((step, idx) => (
                    <li key={idx} className="relative pl-8">
                      <div className="absolute -left-[5px] top-1.5 w-[9px] h-[9px] rounded-full bg-slate-800 border border-rose-500/50"></div>
                      <div className="text-sm font-semibold text-rose-400 mb-1">Paso {idx + 1}</div>
                      <h4 className="text-white font-medium mb-1">{step.title}</h4>
                      <p className="text-slate-500 text-sm">{step.desc}</p>
                    </li>
                  ))}
                </ol>
              </div>

              {/* x402 Way */}
              <div className="bg-teal-950/20 border border-teal-500/30 rounded-3xl p-8 md:p-10 relative overflow-hidden shadow-[0_0_50px_-12px_rgba(20,184,166,0.2)]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                <h3 className="text-2xl font-bold text-white flex items-center gap-3 mb-8">
                  <CheckCircle2 className="h-6 w-6 text-teal-400" />
                  Con x402
                </h3>
                <ol className="space-y-8 relative border-l border-teal-500/20 ml-3">
                  {[
                    { title: 'Agente recibe 402: Pago Requerido', desc: 'El agente de IA envía una petición HTTP. No requiere configuración de cuenta, incorporación instantánea.' },
                    { title: 'El agente paga al instante', desc: 'Se utiliza stablecoins (USDC) u otros recursos on-chain vía Stellar. No se requiere registro en corporaciones.' },
                    { title: 'Acceso a la API concedido', desc: 'No hay gestión de claves API ni riesgos de seguridad relacionados. Listo para operar.' }
                  ].map((step, idx) => (
                    <li key={idx} className="relative pl-8">
                      <div className="absolute -left-[5px] top-1.5 w-[9px] h-[9px] rounded-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.8)]"></div>
                      <div className="text-sm font-semibold text-teal-400 mb-1">Paso {idx + 1}</div>
                      <h4 className="text-white font-medium mb-1 text-lg">{step.title}</h4>
                      <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                    </li>
                  ))}
                </ol>
                <div className="mt-12 bg-teal-500/10 border border-teal-500/20 rounded-xl p-6 text-center">
                  <p className="text-teal-200 font-medium">...así que es hora de empezar a construir algo mejor.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6 lg:px-8 text-center relative max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">Únete a una comunidad global</h2>
          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto text-balance">
            Miles de desarrolladores están contribuyendo a un código abierto, un sistema financiero más rápido y una internet mucha más libre.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-black font-semibold hover:bg-slate-200 transition-colors shadow-lg">
              Empezar ahora
            </button>
            <a href="https://developers.stellar.org/docs/build/apps/x402" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto px-8 py-4 rounded-full bg-slate-900 border border-white/10 text-white font-semibold hover:bg-slate-800 transition-colors inline-block text-center">
              Leer Stellar Docs
            </a>
          </div>
          <p className="mt-16 text-sm text-slate-500">
            x402 en NUREA utiliza los facilitadores de Coinbase y OpenZeppelin Relayer integrados directamente en la red de Stellar. 
          </p>
        </section>

        <StackedCircularFooter />
      </div>
    </main>
  )
}
