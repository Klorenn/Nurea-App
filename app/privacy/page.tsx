import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ShieldCheck, Lock, EyeOff } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="flex-1 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-4 bg-teal-100 dark:bg-teal-900/30 rounded-full mb-6">
              <Lock className="h-8 w-8 text-teal-700 dark:text-teal-400" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Política de Privacidad y Manejo de Datos</h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">Última actualización: Marzo 2026</p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <p className="lead text-lg mb-8 font-medium">
              En el ámbito de la salud, sabemos que los datos son extremadamente sensibles. Nuestra arquitectura está desarrollada bajo estándares probos de ciberseguridad para asegurar que la privacidad de pacientes y doctores de NUREA nunca se vea comprometida.
            </p>

            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-10 mb-4 flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-teal-600" />
              1. Almacenamiento de Fichas y Recetas
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Cualquier registro médico, antecedente o receta subida por el profesional o intercambiada con el paciente en la sesión de telemedicina queda resguardado obligatoriamente en <strong>servidores cifrados e inmutables (Supabase Storage Privado y Políticas RLS)</strong>.
            </p>
            <p className="text-slate-600 dark:text-slate-300 mt-4">
              NUREA como corporación no tiene ni tendrá en ninguna circunstancia poder para desencriptar o acceder unilateralmente al contenido de estas atenciones. Solo el médico tratante emisor y el paciente destinatario del tratamiento mantienen las llaves para la lectura histórica de dichas recetas.
            </p>

            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-10 mb-4">
              2. Ejercicio de Derechos ARCO
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Con estricto e irrestricto apego a la legalidad y al respeto, NUREA se somete obligatoriamente a lo dispuesto por la <strong>Ley 19.628 Sobre Protección de la Vida Privada</strong>.
            </p>
            <p className="text-slate-600 dark:text-slate-300 mt-4">
              En cualquier momento, el usuario registrado, tanto en calidad de paciente como de profesional médico, tiene el derecho absoluto e intransable de solicitar el Acceso, Rectificación, Cancelación y Oposición de sus datos resguardados escribiendo de forma directa, acreditando su identidad de acuerdo a los protocolos del equipo de ciberseguridad.
            </p>

            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-10 mb-4 flex items-center gap-2">
              <EyeOff className="h-6 w-6 text-teal-600" />
              3. Protección Absoluta al Secreto Profesional
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              NUREA compromete proactivamente que, dadas las implicancias inherentes del acto de salud, bajo ninguna circunstancia será vendida, transferida ni cedida ante agencias ni terceros la información que se levante y recolecte de origen clínico durante las transacciones e interacciones en la plataforma tecnológica.
            </p>

            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-10 mb-4">
              4. Ciberseguridad General
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Ante nuestra plataforma solo son admitidos aquellos prestadores del rubro sanitario que han superado e interactuado frente a nuestro <strong>Protocolo de Sello de Verificación</strong> automático, una línea restrictiva y encriptada impuesta transversalmente para asegurarle a la comunidad el rechazo anticipado hacia potenciales impostores o especialistas apartados del quehacer normativo del Estado de Chile.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
