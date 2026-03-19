export interface ConditionOption {
  name: string
  slug: string
}

export interface SpecialtyConditionsMap {
  [specialtySlug: string]: ConditionOption[]
}

export const SPECIALTY_CONDITIONS: SpecialtyConditionsMap = {
  psicologia: [
    { name: "Ansiedad", slug: "ansiedad" },
    { name: "Depresión", slug: "depresion" },
    { name: "Estrés", slug: "estres" },
    { name: "Autoestima", slug: "autoestima" },
    { name: "Terapia de pareja", slug: "terapia-pareja" },
    { name: "Duelo", slug: "duelo" },
    { name: "Burnout", slug: "burnout" },
    { name: "Ataques de pánico", slug: "panico" },
    { name: "Fobias", slug: "fobias" },
    { name: "Trastornos del sueño", slug: "sueno" },
  ],
  psiquiatria: [
    { name: "Depresión", slug: "depresion" },
    { name: "Trastorno bipolar", slug: "bipolar" },
    { name: "Esquizofrenia", slug: "esquizofrenia" },
    { name: "TDAH", slug: "tdah" },
    { name: "Adicciones", slug: "adicciones" },
  ],
  "medicina-general": [
    { name: "Dolor general", slug: "dolor" },
    { name: "Fiebre", slug: "fiebre" },
    { name: "Resfriado", slug: "resfriado" },
    { name: "Gripe", slug: "gripe" },
    { name: "Dolor de cabeza", slug: "cefalea" },
    { name: "Hipertensión", slug: "hipertension" },
    { name: "Diabetes", slug: "diabetes" },
  ],
  nutricion: [
    { name: "Bajar de peso", slug: "bajar-peso" },
    { name: "Obesidad", slug: "obesidad" },
    { name: "Colesterol alto", slug: "colesterol" },
    { name: "Diabetes", slug: "diabetes" },
  ],
  kinesiologia: [
    { name: "Dolor muscular", slug: "dolor-muscular" },
    { name: "Lesiones deportivas", slug: "lesiones" },
    { name: "Dolor lumbar", slug: "lumbar" },
  ],
  dermatologia: [
    { name: "Acné", slug: "acne" },
    { name: "Dermatitis", slug: "dermatitis" },
  ],
  cardiologia: [
    { name: "Hipertensión", slug: "hipertension" },
    { name: "Arritmias", slug: "arritmia" },
  ],
  pediatria: [{ name: "Control infantil", slug: "control-infantil" }],
  ginecologia: [{ name: "Embarazo", slug: "embarazo" }],
  neurologia: [{ name: "Migrañas", slug: "migrana" }],
  traumatologia: [{ name: "Fracturas", slug: "fractura" }],
}

