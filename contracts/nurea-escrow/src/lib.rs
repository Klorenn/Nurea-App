//! Contrato de Escrow (depósito en garantía) para citas médicas Nurea.
//! El paciente deposita tokens al agendar; el doctor recibe al completar la cita
//! o el paciente recupera el dinero si se cancela.

#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, token, Address, Env, String, Symbol,
};

// -----------------------------------------------------------------------------
// Tipos de datos almacenados
// -----------------------------------------------------------------------------

/// Datos de un depósito asociado a una cita (appointment_id).
/// Se guarda en almacenamiento persistente usando el appointment_id como llave.
#[contracttype]
pub struct DepositInfo {
    /// Dirección (wallet) del paciente que depositó.
    pub patient: Address,
    /// Dirección (wallet) del doctor que recibirá al liberar.
    pub doctor: Address,
    /// Monto bloqueado (en unidades del token, ej. 10_0000000 para 10 USDC).
    pub amount: i128,
    /// Dirección del contrato del token (ej. USDC testnet).
    pub token: Address,
}

// -----------------------------------------------------------------------------
// Contrato
// -----------------------------------------------------------------------------

#[contract]
pub struct NureaEscrow;

#[contractimpl]
impl NureaEscrow {
    /// Inicializa el contrato con la dirección del admin (Nurea).
    /// Solo se puede llamar una vez. El admin puede llamar a release y refund.
    pub fn init(env: Env, admin: Address) {
        let key = Symbol::new(&env, "admin");
        if env.storage().instance().has(&key) {
            panic!("contrato ya inicializado");
        }
        env.storage().instance().set(&key, &admin);
    }

    /// Obtiene la dirección del admin (solo lectura).
    pub fn admin(env: Env) -> Address {
        env.storage()
            .instance()
            .get::<_, Address>(&Symbol::new(&env, "admin"))
            .expect("contrato no inicializado")
    }

    /// **Deposit**: El paciente bloquea tokens en el contrato para una cita.
    /// El paciente debe haber autorizado la transferencia al contrato (firma en Freighter).
    /// Registra patient, doctor, amount y token asociados al appointment_id.
    pub fn deposit(
        env: Env,
        token: Address,
        appointment_id: String,
        patient: Address,
        doctor: Address,
        amount: i128,
    ) {
        // Solo el paciente puede autorizar este depósito (él paga).
        patient.require_auth();

        // Transferir tokens del paciente al contrato (este contrato recibe y los retiene).
        let contract = env.current_contract_address();
        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&patient, &contract, &amount);

        // Guardar en almacenamiento persistente el estado del depósito para este appointment_id.
        let info = DepositInfo {
            patient: patient.clone(),
            doctor,
            amount,
            token: token.clone(),
        };
        env.storage()
            .persistent()
            .set(&appointment_id, &info);
    }

    /// **Release**: Libera los fondos bloqueados hacia la wallet del doctor.
    /// Solo puede llamarla el Admin (Nurea) o el Paciente. El caller debe firmar (require_auth).
    pub fn release(env: Env, appointment_id: String, caller: Address) {
        caller.require_auth();
        let info: DepositInfo = env
            .storage()
            .persistent()
            .get(&appointment_id)
            .expect("depósito no encontrado para este appointment_id");
        let admin = Self::admin(env.clone());
        if caller != admin && caller != info.patient {
            panic!("solo admin o paciente pueden liberar");
        }
        let token_client = token::Client::new(&env, &info.token);
        let contract = env.current_contract_address();
        // Transferir del contrato al doctor.
        token_client.transfer(&contract, &info.doctor, &info.amount);
        // Eliminar el depósito para que no se pueda liberar/refund de nuevo.
        env.storage().persistent().remove(&appointment_id);
    }

    /// **Refund**: Devuelve los fondos al paciente (ej. cuando la cita se cancela).
    /// Solo puede llamarla el Admin (Nurea) o el Paciente. El caller debe firmar (require_auth).
    pub fn refund(env: Env, appointment_id: String, caller: Address) {
        caller.require_auth();
        let admin = Self::admin(env.clone());
        let info: DepositInfo = env
            .storage()
            .persistent()
            .get(&appointment_id)
            .expect("depósito no encontrado para este appointment_id");
        if caller != admin && caller != info.patient {
            panic!("solo admin o paciente pueden solicitar reembolso");
        }

        let token_client = token::Client::new(&env, &info.token);
        let contract = env.current_contract_address();
        token_client.transfer(&contract, &info.patient, &info.amount);
        env.storage().persistent().remove(&appointment_id);
    }

    /// Consulta los datos de un depósito (sin modificar estado). Útil para el frontend.
    pub fn get_deposit(env: Env, appointment_id: String) -> Option<DepositInfo> {
        env.storage().persistent().get(&appointment_id)
    }
}
