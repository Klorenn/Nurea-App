'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { saveProfessionalProfile, uploadLicenseFile } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const SPECIALTIES = [
  'Médico General',
  'Cardiólogo',
  'Dermatólogo',
  'Neurólogo',
  'Psicólogo',
  'Nutricionista',
  'Kinesiólogo',
  'Fonoaudiólogo',
  'Enfermero',
  'Terapeuta Ocupacional',
  'Oftalmólogo',
  'Otorrinolaringólogo',
  'Pediatra',
  'Ginecólogo',
  'Otro',
];

const SERVICES = [
  'Consulta Online',
  'Consulta Presencial',
  'Revisión de Documentos',
  'Segundo Opinión',
  'Seguimiento',
  'Evaluación',
];

const INSURANCES = [
  'Fonasa',
  'Isapre',
  'Seguros Privados',
  'Sin Seguro',
];

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
];

interface FormData {
  gender: string;
  specialty: string;
  licenseNumber: string;
  licenseFile?: File;
  officeLocation: string;
  phone: string;
  officeHours: Record<string, { start: string; end: string } | null>;
  services: string[];
  insuranceAccepted: string[];
  secondarySpecialties: string[];
}

export default function ProfessionalOnboarding() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);

  const [form, setForm] = useState<FormData>({
    gender: '',
    specialty: '',
    licenseNumber: '',
    officeLocation: '',
    phone: '',
    officeHours: Object.fromEntries(
      DAYS_OF_WEEK.map((day) => [day.key, null])
    ),
    services: [],
    insuranceAccepted: [],
    secondarySpecialties: [],
  });

  const toggleMultiSelect = (field: 'services' | 'insuranceAccepted' | 'secondarySpecialties', value: string) => {
    const current = form[field] as string[];
    if (current.includes(value)) {
      setForm({
        ...form,
        [field]: current.filter((item) => item !== value),
      });
    } else {
      setForm({
        ...form,
        [field]: [...current, value],
      });
    }
  };

  const updateOfficeHours = (day: string, start: string, end: string) => {
    if (!start && !end) {
      setForm({
        ...form,
        officeHours: {
          ...form.officeHours,
          [day]: null,
        },
      });
    } else {
      setForm({
        ...form,
        officeHours: {
          ...form.officeHours,
          [day]: { start, end },
        },
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadLicenseFile(formData);
      setForm({ ...form, licenseFile: file });
      toast.success('Archivo cargado exitosamente');
    } catch (err: any) {
      setError(err.message || 'Error al cargar el archivo');
      toast.error(err.message || 'Error al cargar el archivo');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!form.gender || !form.specialty || !form.licenseNumber || !form.officeLocation || !form.phone) {
        throw new Error('Por favor completa todos los campos requeridos');
      }

      // Upload license file if provided
      let licenseFileUrl: string | undefined;
      if (form.licenseFile) {
        const formData = new FormData();
        formData.append('file', form.licenseFile);
        const result = await uploadLicenseFile(formData);
        licenseFileUrl = result.url;
      }

      await saveProfessionalProfile({
        gender: form.gender,
        specialty: form.specialty,
        licenseNumber: form.licenseNumber,
        licenseFileUrl,
        officeLocation: form.officeLocation,
        phone: form.phone,
        officeHours: form.officeHours,
        services: form.services,
        insuranceAccepted: form.insuranceAccepted,
        secondarySpecialties: form.secondarySpecialties,
        fullName: user?.fullName || '',
        rut: (user?.unsafeMetadata?.rut as string) || '',
        dateOfBirth: (user?.unsafeMetadata?.dateOfBirth as string) || '',
      });

      toast.success('Perfil completado exitosamente');
      router.push('/dashboard');
    } catch (err: any) {
      const errorMsg = err.message || 'Error al guardar el perfil';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-2">Completa tu Perfil Profesional</h1>
        <p className="text-gray-600 mb-8">Proporciona información sobre tu práctica profesional</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section: Personal Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Información Personal</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Gender */}
              <div>
                <Label htmlFor="gender" className="font-semibold">
                  Género *
                </Label>
                <select
                  id="gender"
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  required
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecciona tu género</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="no_binario">No binario</option>
                  <option value="prefiero_no">Prefiero no especificar</option>
                </select>
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone" className="font-semibold">
                  Teléfono *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+56 9 1234 5678"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          {/* Section: Professional Credentials */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Credenciales Profesionales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Specialty */}
              <div>
                <Label htmlFor="specialty" className="font-semibold">
                  Especialidad Principal *
                </Label>
                <select
                  id="specialty"
                  value={form.specialty}
                  onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                  required
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecciona tu especialidad</option>
                  {SPECIALTIES.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>

              {/* License Number */}
              <div>
                <Label htmlFor="licenseNumber" className="font-semibold">
                  Número de Licencia *
                </Label>
                <Input
                  id="licenseNumber"
                  type="text"
                  placeholder="Ej: 123456789"
                  value={form.licenseNumber}
                  onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                  required
                  className="mt-2"
                />
              </div>
            </div>

            {/* Secondary Specialties */}
            <div className="mt-6">
              <Label className="font-semibold mb-3 block">Especialidades Secundarias</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {SPECIALTIES.filter((spec) => spec !== form.specialty).map((spec) => (
                  <label key={spec} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.secondarySpecialties.includes(spec)}
                      onChange={() => toggleMultiSelect('secondarySpecialties', spec)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2"
                    />
                    <span className="text-sm text-gray-700">{spec}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* License File Upload */}
            <div className="mt-6">
              <Label htmlFor="licenseFile" className="font-semibold">
                Documento de Licencia (Opcional)
              </Label>
              <p className="text-sm text-gray-600 mb-2">
                Carga un PDF, JPEG, PNG o WebP (máximo 5MB)
              </p>
              <input
                id="licenseFile"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={handleFileChange}
                disabled={uploadingFile}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {uploadingFile && <p className="text-sm text-gray-600 mt-2">Cargando archivo...</p>}
              {form.licenseFile && <p className="text-sm text-green-600 mt-2">✓ {form.licenseFile.name}</p>}
            </div>
          </div>

          {/* Section: Office Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Información del Consultorio</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Office Location */}
              <div className="md:col-span-2">
                <Label htmlFor="officeLocation" className="font-semibold">
                  Ubicación del Consultorio *
                </Label>
                <Input
                  id="officeLocation"
                  type="text"
                  placeholder="Calle, número, comuna, región"
                  value={form.officeLocation}
                  onChange={(e) => setForm({ ...form, officeLocation: e.target.value })}
                  required
                  className="mt-2"
                />
              </div>
            </div>

            {/* Office Hours */}
            <div className="mt-6">
              <Label className="font-semibold mb-4 block">Horario de Atención</Label>
              <div className="space-y-3">
                {DAYS_OF_WEEK.map((day) => {
                  const hours = form.officeHours[day.key];
                  return (
                    <div key={day.key} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <Label className="text-gray-700">{day.label}</Label>
                      <Input
                        type="time"
                        value={hours?.start || ''}
                        onChange={(e) =>
                          updateOfficeHours(day.key, e.target.value, hours?.end || '')
                        }
                        placeholder="Inicio"
                        className=""
                      />
                      <Input
                        type="time"
                        value={hours?.end || ''}
                        onChange={(e) =>
                          updateOfficeHours(day.key, hours?.start || '', e.target.value)
                        }
                        placeholder="Fin"
                        className=""
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section: Services & Insurance */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Servicios y Seguros</h2>

            {/* Services */}
            <div className="mb-6">
              <Label className="font-semibold mb-3 block">Servicios que Ofreces</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {SERVICES.map((service) => (
                  <label key={service} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.services.includes(service)}
                      onChange={() => toggleMultiSelect('services', service)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2"
                    />
                    <span className="text-sm text-gray-700">{service}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Insurance */}
            <div>
              <Label className="font-semibold mb-3 block">Seguros Aceptados</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {INSURANCES.map((insurance) => (
                  <label key={insurance} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.insuranceAccepted.includes(insurance)}
                      onChange={() => toggleMultiSelect('insuranceAccepted', insurance)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2"
                    />
                    <span className="text-sm text-gray-700">{insurance}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-6">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="inline mr-2 h-4 w-4 animate-spin" />
                  Completando...
                </>
              ) : (
                'Completar Perfil'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
