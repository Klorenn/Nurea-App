# Configuración del Escrow (Soroban) – Nurea

Pasos para tener el contrato de escrow desplegado y el backend listo.

## 1. Compilar y desplegar el contrato (terminal)

Desde la raíz del proyecto:

```bash
# Compilar
cd contracts/nurea-escrow
cargo build --target wasm32-unknown-unknown --release

# Crear cuenta admin Testnet
stellar keys generate nurea-admin --network testnet

# Desplegar (sustituir si usas otro source)
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/nurea_escrow.wasm \
  --source nurea-admin \
  --network testnet

# Inicializar (sustituir CONTRACT_ID y PUBLIC_KEY)
stellar contract invoke \
  --id [TU_CONTRACT_ID_AQUI] \
  --source nurea-admin \
  --network testnet \
  -- \
  init --admin [LA_PUBLIC_KEY_DE_NUREA_ADMIN]
```

Guarda el **Contract ID** (empieza por `C...`) y la **secret key** de `nurea-admin`.

## 2. Variables de entorno (`.env.local`)

En la raíz del proyecto Next.js, en `.env.local`:

```env
# Contrato de escrow (público)
NEXT_PUBLIC_ESCROW_CONTRACT_ID=C...
NEXT_PUBLIC_ESCROW_TOKEN_ID=CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC

# Solo servidor (liberar pagos como admin). No exponer en cliente.
NUREA_ADMIN_SECRET_KEY=S...
```

- **NEXT_PUBLIC_ESCROW_CONTRACT_ID**: Contract ID del paso de despliegue.
- **NEXT_PUBLIC_ESCROW_TOKEN_ID**: XLM nativo Testnet (valor fijo de arriba).
- **NUREA_ADMIN_SECRET_KEY**: Secret key de la cuenta `nurea-admin`.

Opcional:

```env
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
```

## 3. Flujo ya implementado

- **prepare-deposit** y **submit**: usan Soroban RPC para armar la tx de `deposit` y enviarla; el paciente firma con Freighter.
- **release**: el backend firma con `NUREA_ADMIN_SECRET_KEY`, invoca `release(appointment_id, admin)` y solo si la tx es exitosa actualiza Supabase a `completed` y `payment_status: paid`.
- Dashboard profesional: botón "Completada" para citas con `escrow_locked` llama a `/api/escrow/release` y muestra "Liberando fondos..." hasta que termina.
