-- ============================================================================
-- NUREA - SISTEMA FINANCIERO Y PAGOS ESCROW
-- ============================================================================

-- 1. Tabla de Configuración de la Plataforma
CREATE TABLE IF NOT EXISTS public.platform_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insertar comisión base (15%)
INSERT INTO public.platform_settings (key, value, description)
VALUES ('commission_rate', '0.15', 'Tasa de comisión de la plataforma (0.15 = 15%)')
ON CONFLICT (key) DO NOTHING;

-- 2. Tabla de Transacciones Financieras
CREATE TABLE IF NOT EXISTS public.financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.profiles(id),
    professional_id UUID NOT NULL REFERENCES public.profiles(id),
    
    amount_total NUMERIC(12,2) NOT NULL,
    platform_fee NUMERIC(12,2) NOT NULL,
    professional_net NUMERIC(12,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'CLP',
    
    status TEXT NOT NULL DEFAULT 'escrow' 
        CHECK (status IN ('escrow', 'available', 'payout_pending', 'paid_out', 'refunded')),
    
    stripe_session_id TEXT,
    stripe_payment_intent_id TEXT,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_financial_transactions_appointment ON public.financial_transactions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_professional ON public.financial_transactions(professional_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_patient ON public.financial_transactions(patient_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_status ON public.financial_transactions(status);

-- 3. RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

-- Solo admins pueden leer/editar settings
CREATE POLICY "Admins can manage platform_settings" ON public.platform_settings
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Usuarios pueden ver sus propias transacciones
CREATE POLICY "Users can view their own transactions" ON public.financial_transactions
    FOR SELECT USING (
        auth.uid() = patient_id OR auth.uid() = professional_id OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Solo el sistema (service role) o admin puede insertar/actualizar transacciones
CREATE POLICY "Admins can manage transactions" ON public.financial_transactions
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- 4. Functión RPC para completar cita y liberar fondos (Seguridad Atómica)
CREATE OR REPLACE FUNCTION public.complete_appointment_and_release_funds(p_appointment_id UUID)
RETURNS VOID AS $$
DECLARE
    v_transaction_id UUID;
BEGIN
    -- 1. Actualizar cita a completada
    UPDATE public.appointments 
    SET status = 'completed', updated_at = now()
    WHERE id = p_appointment_id;

    -- 2. Cambiar status de transacción de escrow a available
    UPDATE public.financial_transactions
    SET status = 'available', updated_at = now()
    WHERE appointment_id = p_appointment_id AND status = 'escrow';

    -- Log (opcional si tienes tabla de logs)
    RAISE NOTICE 'Appointment % completed and funds released.', p_appointment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Función RPC para confirmar pago de cita (Seguridad Atómica)
CREATE OR REPLACE FUNCTION public.confirm_appointment_payment(
    p_appointment_id UUID,
    p_stripe_session_id TEXT,
    p_payment_intent_id TEXT,
    p_amount_total NUMERIC,
    p_commission_rate NUMERIC
)
RETURNS VOID AS $$
DECLARE
    v_patient_id UUID;
    v_professional_id UUID;
    v_platform_fee NUMERIC;
    v_professional_net NUMERIC;
BEGIN
    -- 1. Obtener datos de la cita
    SELECT patient_id, professional_id INTO v_patient_id, v_professional_id
    FROM public.appointments
    WHERE id = p_appointment_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Appointment not found';
    END IF;

    -- 2. Calcular montos
    v_platform_fee := p_amount_total * p_commission_rate;
    v_professional_net := p_amount_total - v_platform_fee;

    -- 3. Crear registro financiero en 'escrow'
    INSERT INTO public.financial_transactions (
        appointment_id,
        patient_id,
        professional_id,
        amount_total,
        platform_fee,
        professional_net,
        status,
        stripe_session_id,
        stripe_payment_intent_id
    ) VALUES (
        p_appointment_id,
        v_patient_id,
        v_professional_id,
        p_amount_total,
        v_platform_fee,
        v_professional_net,
        'escrow',
        p_stripe_session_id,
        p_payment_intent_id
    );

    -- 4. Actualizar cita
    UPDATE public.appointments
    SET 
        status = 'confirmed',
        payment_status = 'paid',
        updated_at = now()
    WHERE id = p_appointment_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
