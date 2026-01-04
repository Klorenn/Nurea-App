/**
 * Mensajes humanos y empáticos para autenticación
 * Diseñados para un producto de salud, no una app genérica
 */

export const authMessages = {
  es: {
    // Explicaciones de por qué pedimos cada dato
    whyEmail: 'Tu email es tu identidad en NUREA. Lo usamos para confirmar tus citas y mantener tu información segura.',
    whyPassword: 'Una contraseña fuerte protege tu información de salud. Solo tú y tus profesionales autorizados pueden acceder.',
    whyName: 'Tu nombre nos ayuda a personalizar tu experiencia y permite que los profesionales te conozcan mejor.',
    whyDateOfBirth: 'Tu fecha de nacimiento nos ayuda a verificar tu identidad y asegurar que solo tú accedas a tu información médica.',
    whyRole: 'Saber si eres paciente o profesional nos permite mostrarte las herramientas correctas desde el primer día.',
    
    // Mensajes de éxito
    signupSuccess: '¡Bienvenido a NUREA! Te hemos enviado un email para verificar tu cuenta.',
    loginSuccess: '¡Bienvenido de vuelta! Redirigiendo a tu dashboard...',
    passwordResetSent: 'Te hemos enviado un enlace seguro a tu email. Revisa tu bandeja de entrada (y spam).',
    passwordResetSuccess: 'Tu contraseña ha sido actualizada. Ya puedes iniciar sesión con tu nueva contraseña.',
    emailVerified: '¡Tu email ha sido verificado! Ya puedes acceder a todas las funciones de NUREA.',
    
    // Mensajes de error empáticos
    genericError: 'Algo salió mal. Por favor, intenta nuevamente. Si el problema persiste, contáctanos.',
    networkError: 'Parece que hay un problema de conexión. Verifica tu internet e intenta nuevamente.',
    sessionExpired: 'Tu sesión ha expirado por seguridad. Por favor, inicia sesión nuevamente.',
    
    // Estados de carga
    signingIn: 'Iniciando sesión...',
    signingUp: 'Creando tu cuenta...',
    sendingEmail: 'Enviando email...',
    verifying: 'Verificando...',
    
    // Confirmaciones
    confirmLogout: '¿Estás seguro de que quieres cerrar sesión?',
  },
  en: {
    // Explications of why we ask for each data
    whyEmail: 'Your email is your identity on NUREA. We use it to confirm your appointments and keep your information secure.',
    whyPassword: 'A strong password protects your health information. Only you and your authorized professionals can access it.',
    whyName: 'Your name helps us personalize your experience and allows professionals to know you better.',
    whyDateOfBirth: 'Your date of birth helps us verify your identity and ensure only you can access your medical information.',
    whyRole: 'Knowing if you\'re a patient or professional allows us to show you the right tools from day one.',
    
    // Success messages
    signupSuccess: 'Welcome to NUREA! We\'ve sent you an email to verify your account.',
    loginSuccess: 'Welcome back! Redirecting to your dashboard...',
    passwordResetSent: 'We\'ve sent a secure link to your email. Check your inbox (and spam).',
    passwordResetSuccess: 'Your password has been updated. You can now sign in with your new password.',
    emailVerified: 'Your email has been verified! You can now access all NUREA features.',
    
    // Empathetic error messages
    genericError: 'Something went wrong. Please try again. If the problem persists, contact us.',
    networkError: 'It seems there\'s a connection issue. Check your internet and try again.',
    sessionExpired: 'Your session has expired for security. Please sign in again.',
    
    // Loading states
    signingIn: 'Signing in...',
    signingUp: 'Creating your account...',
    sendingEmail: 'Sending email...',
    verifying: 'Verifying...',
    
    // Confirmations
    confirmLogout: 'Are you sure you want to sign out?',
  },
}

