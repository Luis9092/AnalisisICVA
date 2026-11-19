/**
 * Dataset Oficial: Auditoría de Vulnerabilidad Técnica y Autenticidad Web (ICVA)
 * Muestra: 13 Establecimientos de Hospedaje en Antigua Guatemala registrados ante INGUAT
 */

const AUDIT_DATA = {
  metadata: {
    title: "Auditoría de Vulnerabilidad Técnica y Autenticidad en Sitios Web de Hospedaje",
    location: "Antigua Guatemala, Sacatepéquez, Guatemala",
    entity: "Instituto Guatemalteco de Turismo (INGUAT)",
    framework: "Índice Compuesto de Vulnerabilidad y Autenticidad (ICVA)",
    scale: "0 a 100 puntos",
    totalHotels: 13,
    activeHotels: 9,
    downHotels: 4,
    auditDate: "Noviembre 2026",
    scaleTiers: [
      { name: "Vulnerabilidad Alta (Crítica)", range: "0 - 39 pts", color: "#f43f5e", bg: "rgba(244, 63, 94, 0.15)", border: "#f43f5e" },
      { name: "Vulnerabilidad Media", range: "40 - 69 pts", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)", border: "#f59e0b" },
      { name: "Vulnerabilidad Baja (Resiliente)", range: "70 - 100 pts", color: "#10b981", bg: "rgba(16, 185, 129, 0.15)", border: "#10b981" }
    ]
  },
  indicators: [
    {
      id: "1.1",
      dimension: 1,
      name: "Typosquatting (dnstwist)",
      description: "Detección de nombres de dominio similares o imitadores registrados por terceros con fines de phishing o suplantación.",
      tool: "dnstwist",
      maxPoints: 15,
      weight: "15 pts.",
      category: "Amenazas Externas"
    },
    {
      id: "1.2",
      dimension: 1,
      name: "Certificados anómalos (crt.sh)",
      description: "Inspección de Certificate Transparency logs para identificar certificados TLS no autorizados emitidos para el dominio.",
      tool: "crt.sh",
      maxPoints: 15,
      weight: "15 pts.",
      category: "Amenazas Externas"
    },
    {
      id: "1.3",
      dimension: 1,
      name: "Contenido web imitador (curl/Shodan)",
      description: "Rastreo de servidores externos que clonan o suplantan activos visuales, marcas o formularios de reserva del hotel.",
      tool: "curl / Shodan",
      maxPoints: 10,
      weight: "10 pts.",
      category: "Amenazas Externas"
    },
    {
      id: "2.1",
      dimension: 2,
      name: "Titularidad dominio (INGUAT/WHOIS)",
      description: "Verificación de coincidencia legal entre el propietario registrado en el directorio oficial de INGUAT y la información WHOIS/RDAP.",
      tool: "INGUAT / WHOIS",
      maxPoints: 10,
      weight: "10 pts.",
      category: "Controles Defensivos"
    },
    {
      id: "2.2",
      dimension: 2,
      name: "Cifrado TLS/SSL (Qualys SSL Labs)",
      description: "Evaluación de la robustez criptográfica, protocolos vigentes (TLS 1.2/1.3), cipher suites y grado de calificación SSL.",
      tool: "Qualys SSL Labs",
      maxPoints: 15,
      weight: "15 pts.",
      category: "Controles Defensivos"
    },
    {
      id: "2.3",
      dimension: 2,
      name: "Validación DNSSEC (DNSSEC Analyzer)",
      description: "Comprobación de firmas criptográficas en los registros DNS para evitar envenenamiento de caché y secuestro de tráfico.",
      tool: "DNSSEC Analyzer",
      maxPoints: 10,
      weight: "10 pts.",
      category: "Controles Defensivos"
    },
    {
      id: "2.4",
      dimension: 2,
      name: "Cabecera HSTS (curl -I)",
      description: "Presencia y correcta configuración de Strict-Transport-Security (max-age, includeSubDomains, preload) para forzar HTTPS.",
      tool: "curl -I",
      maxPoints: 15,
      weight: "15 pts.",
      category: "Controles Defensivos"
    },
    {
      id: "2.5",
      dimension: 2,
      name: "Cabeceras HTTP (SecurityHeaders)",
      description: "Auditoría de cabeceras de protección activa del navegador: Content-Security-Policy (CSP), X-Frame-Options, X-Content-Type-Options.",
      tool: "SecurityHeaders",
      maxPoints: 5,
      weight: "5 pts.",
      category: "Controles Defensivos"
    },
    {
      id: "2.6",
      dimension: 2,
      name: "SPF / DMARC (checkdmarc)",
      description: "Configuración de autenticación de correo electrónico para prevenir la suplantación de identidad (spoofing) de la marca hotelera.",
      tool: "checkdmarc",
      maxPoints: 5,
      weight: "5 pts.",
      category: "Controles Defensivos"
    }
  ],
  hotels: [
    {
      id: 1,
      name: "Hotel Aurora",
      url: "https://hotelauroraantigua.com/es-gt/",
      cleanUrl: "hotelauroraantigua.com",
      status: "Activo",
      stars: 4,
      isDown: false,
      scores: {
        "1.1": 15.0,
        "1.2": 15.0,
        "1.3": 10.0,
        "2.1": 10.0,
        "2.2": 10.0,
        "2.3": 5.0,
        "2.4": 0.0,
        "2.5": 0.0,
        "2.6": 2.5
      },
      d1: 40.0,
      d2: 27.5,
      icva: 67.5,
      tier: "Vulnerabilidad Media",
      notes: "Canal web institucional operando con buena protección externa contra suplantación (40/40 en D1). Sin embargo, adolece de controles defensivos modernos en el servidor: carece de cabecera HSTS (0/15) y cabeceras de protección HTTP (0/5), lo que expone a los visitantes a ataques de degradación de protocolo y clickjacking.",
      recommendations: [
        "Implementar la cabecera Strict-Transport-Security (HSTS) con un max-age de al menos 31536000 segundos y directiva includeSubDomains.",
        "Añadir cabeceras de seguridad indispensables: Content-Security-Policy, X-Frame-Options: DENY, y X-Content-Type-Options: nosniff.",
        "Reforzar la política DMARC pasando de p=none a p=quarantine o p=reject."
      ]
    },
    {
      id: 2,
      name: "Hotel Candelaria",
      url: "https://hotelcandelaria.com/",
      cleanUrl: "hotelcandelaria.com",
      status: "Activo",
      stars: 4,
      isDown: false,
      scores: {
        "1.1": 7.5,
        "1.2": 15.0,
        "1.3": 10.0,
        "2.1": 10.0,
        "2.2": 15.0,
        "2.3": 5.0,
        "2.4": 7.5,
        "2.5": 2.5,
        "2.6": 2.5
      },
      d1: 32.5,
      d2: 42.5,
      icva: 75.0,
      tier: "Vulnerabilidad Baja",
      notes: "Buen equilibrio entre ambas dimensiones defensivas. Cuenta con cifrado TLS/SSL sobresaliente (15/15) y cabecera HSTS parcial (7.5/15). Se detectaron coincidencias potenciales en dnstwist que ameritan monitoreo preventivo de dominios homógrafos.",
      recommendations: [
        "Monitorear activamente dominios tipográficos generados por dnstwist para evitar campañas de reserva fraudulenta.",
        "Completar la configuración de HSTS para calificar en la lista HSTS Preload de los navegadores.",
        "Extender la cobertura de cabeceras HTTP de seguridad a nivel estricto."
      ]
    },
    {
      id: 3,
      name: "Cissus Hotel",
      url: "https://www.cissushotel.com/",
      cleanUrl: "cissushotel.com",
      status: "Activo",
      stars: 3,
      isDown: false,
      scores: {
        "1.1": 7.5,
        "1.2": 15.0,
        "1.3": 10.0,
        "2.1": 10.0,
        "2.2": 10.0,
        "2.3": 5.0,
        "2.4": 0.0,
        "2.5": 0.0,
        "2.6": 2.5
      },
      d1: 32.5,
      d2: 27.5,
      icva: 60.0,
      tier: "Vulnerabilidad Media",
      notes: "El sitio web se encuentra en funcionamiento pero muestra vulnerabilidades sustanciales en su configuración de servidor. Carece totalmente de HSTS y cabeceras de endurecimiento HTTP. Su autenticación DMARC es básica y no ofrece protección restrictiva.",
      recommendations: [
        "Desplegar cabeceras defensivas HSTS y CSP en el servidor web.",
        "Mejorar la configuración de cifrado SSL/TLS para alcanzar calificación A+ en SSL Labs.",
        "Vigilar variantes de dominio similares registradas."
      ]
    },
    {
      id: 4,
      name: "Hotel Palacio Chico",
      url: "http://www.hotelpalaciochico.com",
      cleanUrl: "hotelpalaciochico.com",
      status: "Caído / Inoperativo",
      stars: 3,
      isDown: true,
      scores: {
        "1.1": 0.0,
        "1.2": 0.0,
        "1.3": 0.0,
        "2.1": 0.0,
        "2.2": 0.0,
        "2.3": 0.0,
        "2.4": 0.0,
        "2.5": 0.0,
        "2.6": 0.0
      },
      d1: 0.0,
      d2: 0.0,
      icva: 0.0,
      tier: "Vulnerabilidad Alta",
      notes: "Sitio web oficial caído e inoperativo. A pesar de estar formalmente registrado en la base de datos de INGUAT, el servidor no responde a peticiones HTTP/HTTPS (Regla de frontera técnica condicional: ICVA = 0 pts). Representa un riesgo crítico de abandono de dominio susceptible a ciberocupación maliciosa.",
      recommendations: [
        "Restablecer de forma inmediata el servicio web o actualizar el enlace oficial ante INGUAT.",
        "Asegurar la titularidad y renovación anticipada del dominio para prevenir ataques de Drop Catching.",
        "Implementar monitoreo de disponibilidad 24/7 (uptime monitoring)."
      ]
    },
    {
      id: 5,
      name: "Meson Del Valle",
      url: "http://www.hotelmesondelvalle.com",
      cleanUrl: "hotelmesondelvalle.com",
      status: "Activo",
      stars: 4,
      isDown: false,
      scores: {
        "1.1": 15.0,
        "1.2": 15.0,
        "1.3": 10.0,
        "2.1": 10.0,
        "2.2": 15.0,
        "2.3": 10.0,
        "2.4": 7.5,
        "2.5": 2.5,
        "2.6": 0.0
      },
      d1: 40.0,
      d2: 45.0,
      icva: 85.0,
      tier: "Vulnerabilidad Baja",
      notes: "Segundo mejor desempeño de la muestra con 85.0 puntos. Protección impecable en Dimensión 1 (40/40), excelente cifrado TLS/SSL (15/15) y validación DNSSEC completa (10/10). Su único punto débil crítico es la ausencia de SPF/DMARC (0/5), lo que expone su dominio a envío de correos suplantados a nombre del hotel.",
      recommendations: [
        "Configurar urgentemente registros TXT para SPF y directivas DMARC para blindar el correo institucional.",
        "Completar la directiva HSTS para forzar el paso a la lista preload de navegadores.",
        "Endurecer las directivas de Content-Security-Policy (CSP)."
      ]
    },
    {
      id: 6,
      name: "Hotel La Galera",
      url: "http://www.hotel-lagalera.com",
      cleanUrl: "hotel-lagalera.com",
      status: "Caído / Inoperativo",
      stars: 3,
      isDown: true,
      scores: {
        "1.1": 0.0,
        "1.2": 0.0,
        "1.3": 0.0,
        "2.1": 0.0,
        "2.2": 0.0,
        "2.3": 0.0,
        "2.4": 0.0,
        "2.5": 0.0,
        "2.6": 0.0
      },
      d1: 0.0,
      d2: 0.0,
      icva: 0.0,
      tier: "Vulnerabilidad Alta",
      notes: "Sitio web no disponible en la red pública. El enlace consignado en el registro de INGUAT produce error de conexión no resuelta. Ponderado con 0 pts conforme a la frontera técnica por inoperatividad de canal institucional.",
      recommendations: [
        "Verificar el estado del registro DNS y hosting del establecimiento.",
        "Depurar la base de datos pública de prestadores de servicios turísticos de INGUAT.",
        "Restaurar la presencia digital bajo estándares HTTPS modernos."
      ]
    },
    {
      id: 7,
      name: "Hotel Posada Placida Antigua",
      url: "http://www.hotelplacidantigua.com",
      cleanUrl: "hotelplacidantigua.com",
      status: "Caído / Inoperativo",
      stars: 3,
      isDown: true,
      scores: {
        "1.1": 0.0,
        "1.2": 0.0,
        "1.3": 0.0,
        "2.1": 0.0,
        "2.2": 0.0,
        "2.3": 0.0,
        "2.4": 0.0,
        "2.5": 0.0,
        "2.6": 0.0
      },
      d1: 0.0,
      d2: 0.0,
      icva: 0.0,
      tier: "Vulnerabilidad Alta",
      notes: "Tercer sitio registrado que se encuentra inactivo. No provee servicio web ni resolución a los turistas que consultan el catálogo de INGUAT, exponiendo a los viajeros a recurrir a canales no verificados de terceros.",
      recommendations: [
        "Reactivar la plataforma web institucional con certificados TLS confiables.",
        "Actualizar la ficha técnica de contacto en los registros oficiales.",
        "Adoptar un protocolo de verificación técnica previa al registro de prestadores."
      ]
    },
    {
      id: 8,
      name: "Hotel Camino Real",
      url: "http://www.caminorealantigua.com.gt",
      cleanUrl: "caminorealantigua.com.gt",
      status: "Activo",
      stars: 5,
      isDown: false,
      scores: {
        "1.1": 15.0,
        "1.2": 15.0,
        "1.3": 10.0,
        "2.1": 0.0,
        "2.2": 15.0,
        "2.3": 10.0,
        "2.4": 0.0,
        "2.5": 0.0,
        "2.6": 2.5
      },
      d1: 40.0,
      d2: 27.5,
      icva: 67.5,
      tier: "Vulnerabilidad Media",
      notes: "Hotel de alta categoría con infraestructura robusta en cifrado TLS (15/15) y DNSSEC (10/10). Sin embargo, pierde 10 pts en Titularidad de Dominio (2.1) debido a discordancias entre los datos legales de INGUAT y el registrante WHOIS. Además, no cuenta con HSTS ni cabeceras HTTP defensivas.",
      recommendations: [
        "Regularizar la información registral del dominio .gt con la razón social registrada en INGUAT.",
        "Implementar HSTS estricto para proteger la navegación de clientes corporativos y turistas.",
        "Incorporar cabeceras Content-Security-Policy y Permissions-Policy."
      ]
    },
    {
      id: 9,
      name: "Hotel Solei",
      url: "http://www.gruposoleil.com",
      cleanUrl: "gruposoleil.com",
      status: "Caído / Inoperativo (Local)",
      stars: 5,
      isDown: true,
      scores: {
        "1.1": 0.0,
        "1.2": 0.0,
        "1.3": 0.0,
        "2.1": 0.0,
        "2.2": 0.0,
        "2.3": 0.0,
        "2.4": 0.0,
        "2.5": 0.0,
        "2.6": 0.0
      },
      d1: 0.0,
      d2: 0.0,
      icva: 0.0,
      tier: "Vulnerabilidad Alta",
      notes: "Hallazgo crítico: Si bien la página del corporativo matriz funciona, la subpágina específica destinada a Antigua Guatemala reportada ante INGUAT está caída y no funciona, a pesar de tratarse de un hotel clasificado con 5 estrellas por el INGUAT. Asignada ponderación 0 pts por inoperatividad del activo auditado.",
      recommendations: [
        "Reparar el enrutamiento o micro-sitio específico para la sede de Antigua Guatemala.",
        "Implementar un redireccionamiento 301 automático si la estructura de URLs del grupo cambió.",
        "Actualizar la URL canónica en el expediente oficial de prestadores de servicios de INGUAT."
      ]
    },
    {
      id: 10,
      name: "Hotel Casa Antigua",
      url: "http://www.hotelcasa-antigua.com",
      cleanUrl: "hotelcasa-antigua.com",
      status: "Activo (Líder)",
      stars: 4,
      isDown: false,
      scores: {
        "1.1": 15.0,
        "1.2": 15.0,
        "1.3": 10.0,
        "2.1": 10.0,
        "2.2": 15.0,
        "2.3": 10.0,
        "2.4": 7.5,
        "2.5": 2.5,
        "2.6": 2.5
      },
      d1: 40.0,
      d2: 47.5,
      icva: 87.5,
      tier: "Vulnerabilidad Baja",
      notes: "Calificación más alta de toda la auditoría (87.5 puntos). Cumplimiento del 100% en Dimensión 1 (40/40), titularidad verificada, cifrado TLS perfecto, DNSSEC validado y presencia de HSTS y cabeceras de seguridad. Es el referente de ciberseguridad web en la muestra analizada.",
      recommendations: [
        "Completar la directiva HSTS preload para alcanzar los 15 pts completos en el indicador 2.4.",
        "Reforzar la política DMARC de p=none hacia p=reject para evitar cualquier vector de suplantación por email.",
        "Mantener revisiones periódicas de dependencias web y librerías JavaScript."
      ]
    },
    {
      id: 11,
      name: "El Marquez De Antigua",
      url: "http://www.elmarquesdeantigua.com",
      cleanUrl: "elmarquesdeantigua.com",
      status: "Activo",
      stars: 4,
      isDown: false,
      scores: {
        "1.1": 0.0,
        "1.2": 15.0,
        "1.3": 10.0,
        "2.1": 10.0,
        "2.2": 15.0,
        "2.3": 10.0,
        "2.4": 15.0,
        "2.5": 2.5,
        "2.6": 0.0
      },
      d1: 25.0,
      d2: 52.5,
      icva: 77.5,
      tier: "Vulnerabilidad Baja",
      notes: "Caso de estudio de gran interés técnico: Ostenta la mayor puntuación defensiva de la muestra en Dimensión 2 (52.5 / 60), siendo el ÚNICO hotel con calificación perfecta en HSTS (15/15) y cifrado TLS (15/15). No obstante, obtuvo 0 pts en Typosquatting (1.1) por exposición a dominios engañosos y 0 pts en SPF/DMARC.",
      recommendations: [
        "Iniciar un proceso de mitigación de dominios imitadores y typosquatting detectados en dnstwist.",
        "Configurar registros SPF y política DMARC para blindar las comunicaciones del hotel.",
        "Adquirir variantes defensivas clave de su nombre de dominio (.net, .gt, errores de tipeo frecuentes)."
      ]
    },
    {
      id: 12,
      name: "Casa Miravalle",
      url: "http://www.hotelcasamiravalle.com",
      cleanUrl: "hotelcasamiravalle.com",
      status: "Activo",
      stars: 3,
      isDown: false,
      scores: {
        "1.1": 7.5,
        "1.2": 15.0,
        "1.3": 10.0,
        "2.1": 10.0,
        "2.2": 15.0,
        "2.3": 10.0,
        "2.4": 0.0,
        "2.5": 0.0,
        "2.6": 2.5
      },
      d1: 32.5,
      d2: 37.5,
      icva: 70.0,
      tier: "Vulnerabilidad Baja",
      notes: "Observación cualitativa crítica: A pesar de obtener 70.0 pts por contar con TLS y DNSSEC, su sitio web es tecnológicamente obsoleto, la calidad de desarrollo es muy baja y no ofrece una experiencia visual ni funcional adecuada al usuario moderno. Carece de HSTS y cabeceras HTTP de protección.",
      recommendations: [
        "Rediseño y modernización integral de la plataforma web respetando estándares de accesibilidad y UX.",
        "Implementar HSTS y cabeceras de seguridad modernas en el servidor web.",
        "Migrar a un CMS o arquitectura moderna y segura con soporte activo y parches de seguridad."
      ]
    },
    {
      id: 13,
      name: "Hotel Posada De Don Rodrigo",
      url: "http://www.posadadedonrodrigo.com",
      cleanUrl: "posadadedonrodrigo.com",
      status: "Activo (Crítico)",
      stars: 4,
      isDown: false,
      scores: {
        "1.1": 0.0,
        "1.2": 0.0,
        "1.3": 0.0,
        "2.1": 10.0,
        "2.2": 0.0,
        "2.3": 0.0,
        "2.4": 0.0,
        "2.5": 0.0,
        "2.6": 2.5
      },
      d1: 0.0,
      d2: 12.5,
      icva: 12.5,
      tier: "Vulnerabilidad Alta",
      notes: "Anomalía severa de seguridad: Hotel catalogado con 4 estrellas por INGUAT cuya presencia web es un blog rudimentario de vista única. Obtiene solo 12.5 pts (el más bajo de los sitios que responden). Carece de cifrado TLS (0/15), sin DNSSEC, sin HSTS, sin cabeceras y expuesto a múltiples amenazas externas (0/40 en D1).",
      recommendations: [
        "Reemplazar con urgencia el blog monovista por una plataforma web hotelera profesional y segura.",
        "Instalar inmediatamente un certificado TLS/SSL válido con forzado automático HTTPS.",
        "Configurar DNSSEC, HSTS y registros de autenticación de correo SPF/DMARC."
      ]
    }
  ]
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AUDIT_DATA;
}
