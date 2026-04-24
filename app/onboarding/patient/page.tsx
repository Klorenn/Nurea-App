'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { savePatientProfile } from './actions';

const CHRONIC_CONDITIONS = [
  'Diabetes',
  'Hipertensión',
  'Asma',
  'Artritis',
  'Depresión',
  'Ansiedad',
  'Obesidad',
  'Otro',
];

export default function PatientOnboarding() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    gender: '',
    age: '',
    allergies: {
      medications: [] as string[],
      other: [] as string[],
    },
    currentMedications: '',
    familyMedicalHistory: '',
    chronicConditions: [] as string[],
    reasonForConsultation: '',
    lifestyleHabits: {
      alcohol: false,
      smoking: false,
      drugs: false,
      exercise: 'none',
    },
  });

  const [allergyInput, setAllergyInput] = useState('');
  const [allergyType, setAllergyType] = useState<'medications' | 'other'>('medications');

  const addAllergy = () => {
    if (allergyInput.trim()) {
      setForm({
        ...form,
        allergies: {
          ...form.allergies,
          [allergyType]: [...form.allergies[allergyType], allergyInput],
        },
      });
      setAllergyInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await savePatientProfile({
        ...form,
        fullName: user?.fullName || '',
        rut: (user?.unsafeMetadata?.rut as string) || '',
        dateOfBirth: (user?.unsafeMetadata?.dateOfBirth as string) || '',
      });

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-8">Completa tu Perfil de Salud</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Gender */}
          <div>
            <label className="block font-semibold mb-2">Género</label>
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              required
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Selecciona</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="no_binario">No binario</option>
              <option value="prefiero_no">Prefiero no especificar</option>
            </select>
          </div>

          {/* Age */}
          <div>
            <label className="block font-semibold mb-2">Edad</label>
            <input
              type="number"
              min="1"
              max="120"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          {/* Allergies */}
          <div>
            <label className="block font-semibold mb-2">Alergias</label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <select
                  value={allergyType}
                  onChange={(e) => setAllergyType(e.target.value as 'medications' | 'other')}
                  className="px-3 py-2 border rounded"
                >
                  <option value="medications">Medicinas</option>
                  <option value="other">Otras</option>
                </select>
                <input
                  type="text"
                  placeholder="Ej: Penicilina"
                  value={allergyInput}
                  onChange={(e) => setAllergyInput(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded"
                />
                <button
                  type="button"
                  onClick={addAllergy}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Añadir
                </button>
              </div>
              {form.allergies.medications.length > 0 && (
                <div>
                  <p className="text-sm font-semibold">Medicinas:</p>
                  <div className="flex flex-wrap gap-2">
                    {form.allergies.medications.map((allergy) => (
                      <span key={allergy} className="bg-blue-100 px-3 py-1 rounded text-sm">
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {form.allergies.other.length > 0 && (
                <div>
                  <p className="text-sm font-semibold">Otras:</p>
                  <div className="flex flex-wrap gap-2">
                    {form.allergies.other.map((allergy) => (
                      <span key={allergy} className="bg-green-100 px-3 py-1 rounded text-sm">
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Current Medications */}
          <div>
            <label className="block font-semibold mb-2">Medicamentos Actuales (opcional)</label>
            <textarea
              placeholder="Ej: Amoxicilina 500mg c/8h"
              value={form.currentMedications}
              onChange={(e) => setForm({ ...form, currentMedications: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              rows={2}
            />
          </div>

          {/* Family Medical History */}
          <div>
            <label className="block font-semibold mb-2">Antecedentes Médicos Familiares (opcional)</label>
            <textarea
              placeholder="Ej: Padre con diabetes, madre con hipertensión"
              value={form.familyMedicalHistory}
              onChange={(e) => setForm({ ...form, familyMedicalHistory: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              rows={2}
            />
          </div>

          {/* Chronic Conditions */}
          <div>
            <label className="block font-semibold mb-2">Condiciones Crónicas</label>
            <div className="space-y-2">
              {CHRONIC_CONDITIONS.map((condition) => (
                <label key={condition} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.chronicConditions.includes(condition)}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        chronicConditions: e.target.checked
                          ? [...form.chronicConditions, condition]
                          : form.chronicConditions.filter((c) => c !== condition),
                      })
                    }
                  />
                  {condition}
                </label>
              ))}
            </div>
          </div>

          {/* Reason for Consultation */}
          <div>
            <label className="block font-semibold mb-2">Razón de la Consulta / Síntomas</label>
            <textarea
              placeholder="Describe brevemente por qué buscas consulta"
              value={form.reasonForConsultation}
              onChange={(e) => setForm({ ...form, reasonForConsultation: e.target.value })}
              required
              className="w-full px-3 py-2 border rounded"
              rows={3}
            />
          </div>

          {/* Lifestyle Habits */}
          <div>
            <label className="block font-semibold mb-2">Hábitos de Vida</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.lifestyleHabits.alcohol}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      lifestyleHabits: { ...form.lifestyleHabits, alcohol: e.target.checked },
                    })
                  }
                />
                Consumo de alcohol
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.lifestyleHabits.smoking}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      lifestyleHabits: { ...form.lifestyleHabits, smoking: e.target.checked },
                    })
                  }
                />
                Tabaquismo
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.lifestyleHabits.drugs}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      lifestyleHabits: { ...form.lifestyleHabits, drugs: e.target.checked },
                    })
                  }
                />
                Drogas recreativas
              </label>

              <div>
                <label className="block text-sm font-semibold mb-1">Frecuencia de ejercicio</label>
                <select
                  value={form.lifestyleHabits.exercise}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      lifestyleHabits: { ...form.lifestyleHabits, exercise: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="none">No me ejercito</option>
                  <option value="1-2">1-2 veces por semana</option>
                  <option value="3-4">3-4 veces por semana</option>
                  <option value="5+">5+ veces por semana</option>
                </select>
              </div>
            </div>
          </div>

          {error && <div className="text-red-600">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Guardando...' : 'Completar Perfil'}
          </button>
        </form>
      </div>
    </div>
  );
}
