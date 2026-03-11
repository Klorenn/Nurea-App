"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, UserPlus, Calendar, Trash2 } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import Link from "next/link"

type Dependent = {
  id: string
  firstName: string
  lastName: string
  relation: string
  dateOfBirth: string
}

const MOCK_DEPENDENTS: Dependent[] = [
  { id: "1", firstName: "Ana", lastName: "García", relation: "Hija", dateOfBirth: "2015-03-12" },
  { id: "2", firstName: "Luis", lastName: "García", relation: "Hijo", dateOfBirth: "2018-07-22" },
]

export default function FamilyPage() {
  const { language } = useLanguage()
  const t = useTranslations(language)
  const isSpanish = language === "es"
  const [dependents, setDependents] = useState<Dependent[]>(MOCK_DEPENDENTS)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    relation: "",
    dateOfBirth: "",
  })

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.firstName.trim() || !formData.lastName.trim()) return
    setDependents((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        relation: formData.relation || (isSpanish ? "Familiar" : "Dependent"),
        dateOfBirth: formData.dateOfBirth,
      },
    ])
    setFormData({ firstName: "", lastName: "", relation: "", dateOfBirth: "" })
    setShowForm(false)
  }

  const handleRemove = (id: string) => {
    setDependents((prev) => prev.filter((d) => d.id !== id))
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—"
    return new Date(dateStr).toLocaleDateString(isSpanish ? "es-ES" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const relationOptions = isSpanish
    ? ["Hijo", "Hija", "Cónyuge", "Padre", "Madre", "Otro"]
    : ["Son", "Daughter", "Spouse", "Father", "Mother", "Other"]

  return (
    <DashboardLayout role="patient">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isSpanish ? "Familiares" : "Family"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isSpanish
                ? "Agrega dependientes para agendar citas por ellos"
                : "Add dependents to book appointments on their behalf"}
            </p>
          </div>
          <Button
            className="rounded-xl font-bold"
            onClick={() => setShowForm((v) => !v)}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            {isSpanish ? "Agregar familiar" : "Add family member"}
          </Button>
        </div>

        {showForm && (
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="text-lg">
                {isSpanish ? "Nuevo familiar" : "New family member"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdd} className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fam-firstName">{isSpanish ? "Nombre" : "First name"}</Label>
                  <Input
                    id="fam-firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder={isSpanish ? "Ej. Ana" : "e.g. Ana"}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fam-lastName">{isSpanish ? "Apellido" : "Last name"}</Label>
                  <Input
                    id="fam-lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder={isSpanish ? "Ej. García" : "e.g. García"}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fam-relation">{isSpanish ? "Parentesco" : "Relationship"}</Label>
                  <select
                    id="fam-relation"
                    value={formData.relation}
                    onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">{isSpanish ? "Seleccionar" : "Select"}</option>
                    {relationOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fam-dob">{isSpanish ? "Fecha de nacimiento" : "Date of birth"}</Label>
                  <Input
                    id="fam-dob"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="sm:col-span-2 flex gap-2">
                  <Button type="submit" className="rounded-xl">
                    {isSpanish ? "Guardar" : "Save"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => setShowForm(false)}
                  >
                    {t.dashboard.cancel}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {isSpanish ? "Lista de familiares" : "Family list"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dependents.length > 0 ? (
              <ul className="divide-y divide-border/40">
                {dependents.map((d) => (
                  <li
                    key={d.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 first:pt-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">
                          {d.firstName} {d.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <span>{d.relation}</span>
                          {d.dateOfBirth && (
                            <>
                              <span>·</span>
                              <Calendar className="h-3.5 w-3.5 inline" />
                              {formatDate(d.dateOfBirth)}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="rounded-xl" asChild>
                        <Link href="/search">
                          {isSpanish ? "Agendar cita" : "Book appointment"}
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-xl text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemove(d.id)}
                        aria-label={isSpanish ? `Eliminar ${d.firstName}` : `Remove ${d.firstName}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground font-medium mb-2">
                  {isSpanish ? "No has agregado familiares" : "You haven't added any family members yet"}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  {isSpanish
                    ? "Agrega hijos o dependientes para poder agendar citas por ellos."
                    : "Add children or dependents to book appointments on their behalf."}
                </p>
                <Button className="rounded-xl" onClick={() => setShowForm(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  {isSpanish ? "Agregar familiar" : "Add family member"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
