# Contrato Nurea Escrow (Soroban)

Depósito en garantía para citas médicas: el paciente bloquea el pago al agendar; el doctor recibe los fondos al completar la cita, o el paciente recupera el dinero si se cancela.

## Paso 1: Compilar y desplegar (en tu terminal)

Necesitas **Rust**, el target **wasm32-unknown-unknown** y el **Stellar CLI** (o Soroban CLI).

### 1. Compilar a WASM

```bash
cd contracts/nurea-escrow
cargo build --target wasm32-unknown-unknown --release
```

El `.wasm` queda en `target/wasm32-unknown-unknown/release/nurea_escrow.wasm`.

### 2. Crear cuenta admin (Nurea) en Testnet

```bash
stellar keys generate nurea-admin --network testnet
```

Guarda la **public key** y el **secret key** (este último va en `NUREA_ADMIN_SECRET_KEY` en el servidor).

### 3. Desplegar el contrato

```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/nurea_escrow.wasm \
  --source nurea-admin \
  --network testnet
```

**Guarda el Contract ID** que devuelva (empieza con `C...`). Lo usarás como `NEXT_PUBLIC_ESCROW_CONTRACT_ID`.

### 4. Inicializar el contrato (función init)

```bash
stellar contract invoke \
  --id [TU_CONTRACT_ID_AQUI] \
  --source nurea-admin \
  --network testnet \
  -- \
  init --admin [LA_PUBLIC_KEY_DE_NUREA_ADMIN]
```

Sustituye `[TU_CONTRACT_ID_AQUI]` y `[LA_PUBLIC_KEY_DE_NUREA_ADMIN]` por el Contract ID y la public key de `nurea-admin`.

### 5. Variables de entorno en Next.js

En `.env.local` (en la raíz del proyecto Next.js):

```env
NEXT_PUBLIC_ESCROW_CONTRACT_ID=C...
NEXT_PUBLIC_ESCROW_TOKEN_ID=CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
NUREA_ADMIN_SECRET_KEY=S...
```

- `NEXT_PUBLIC_ESCROW_CONTRACT_ID`: el Contract ID del paso 3.
- `NEXT_PUBLIC_ESCROW_TOKEN_ID`: XLM nativo en Testnet (el valor de arriba es el oficial).
- `NUREA_ADMIN_SECRET_KEY`: secret key de `nurea-admin` (solo en servidor; no exponer en cliente).

## Integración con Next.js

- **deposit**: Lo invoca el paciente (vía Freighter) al confirmar la reserva; pasa `appointment_id`, `doctor`, `amount` y el token (ej. USDC testnet).
- **release**: Lo invoca Nurea (backend) o el paciente cuando la cita se completa; libera fondos al doctor.
- **refund**: Lo invoca Nurea o el paciente cuando la cita se cancela; devuelve fondos al paciente.

El frontend usa `@stellar/stellar-sdk` (o `stellar-sdk`) con el cliente de contratos para invocar estas funciones y firmar con Freighter.
