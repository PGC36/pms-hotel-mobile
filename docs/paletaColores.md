@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@500;600&display=swap');
:root font-family: 'DM Sans'
font-family: 'Playfair Display'

# Paleta de colores — PMS Hoteles Boutique

Paleta cálida en tonos café, beige y blanco. El criterio de fondo es que la interfaz
acompañe sin competir: en la web pública las fotografías de las habitaciones son el
protagonista, y en la web privada los datos operativos deben leerse sin ruido visual.

---

## 1. Marca — cafés

| Token         | Nombre   | Hex       | Uso principal                   |
| ------------- | -------- | --------- | ------------------------------- |
| `--brand-900` | Espresso | `#2E211A` | Texto principal, encabezados    |
| `--brand-800` | Café     | `#4A3728` | Barra lateral, navbar privada   |
| `--brand-600` | Moka     | `#6B4F3A` | Botones primarios               |
| `--brand-400` | Caramelo | `#8B6F52` | Hover, iconos secundarios       |
| `--brand-300` | Dorado   | `#B08D57` | Acento: CTA, badges, destacados |

## 2. Neutros — beige y blanco

| Token        | Nombre | Hex       | Uso principal               |
| ------------ | ------ | --------- | --------------------------- |
| `--sand-300` | Arena  | `#D9C7AE` | Bordes, divisores           |
| `--sand-200` | Beige  | `#E8DCC8` | Filas alternas de tabla     |
| `--sand-100` | Lino   | `#F3EADE` | Superficie de tarjetas      |
| `--sand-50`  | Hueso  | `#FAF7F2` | Fondo de página             |
| `--white`    | Blanco | `#FFFFFF` | Superficie elevada, modales |

## 3. Semánticos

| Token       | Nombre        | Hex       | Uso principal              |
| ----------- | ------------- | --------- | -------------------------- |
| `--success` | Verde salvia  | `#4F7A5B` | Confirmaciones, disponible |
| `--warning` | Ámbar         | `#C08A2E` | Pendientes, stock bajo     |
| `--danger`  | Terracota     | `#A9483C` | Errores, cancelaciones     |
| `--info`    | Azul apagado  | `#5B7C99` | Informativo, en proceso    |
| `--muted`   | Neutro cálido | `#8A8378` | Deshabilitado, bloqueado   |

## 4. Texto

| Token              | Hex       | Uso                       |
| ------------------ | --------- | ------------------------- |
| `--text-primary`   | `#2E211A` | Cuerpo, títulos           |
| `--text-secondary` | `#6B5A4C` | Texto de apoyo, etiquetas |
| `--text-muted`     | `#8A8378` | Placeholders, metadatos   |
| `--text-on-brand`  | `#F3EADE` | Texto sobre fondos café   |

---

## 5. Variables CSS

```css
:root {
  /* Marca */
  --brand-900: #2e211a;
  --brand-800: #4a3728;
  --brand-600: #6b4f3a;
  --brand-400: #8b6f52;
  --brand-300: #b08d57;

  /* Neutros */
  --sand-300: #d9c7ae;
  --sand-200: #e8dcc8;
  --sand-100: #f3eade;
  --sand-50: #faf7f2;
  --white: #ffffff;

  /* Semánticos */
  --success: #4f7a5b;
  --warning: #c08a2e;
  --danger: #a9483c;
  --info: #5b7c99;
  --muted: #8a8378;

  /* Texto */
  --text-primary: #2e211a;
  --text-secondary: #6b5a4c;
  --text-muted: #8a8378;
  --text-on-brand: #f3eade;
}
```

## 6. Configuración para Tailwind

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          900: '#2E211A',
          800: '#4A3728',
          600: '#6B4F3A',
          400: '#8B6F52',
          300: '#B08D57',
        },
        sand: {
          300: '#D9C7AE',
          200: '#E8DCC8',
          100: '#F3EADE',
          50: '#FAF7F2',
        },
        state: {
          success: '#4F7A5B',
          warning: '#C08A2E',
          danger: '#A9483C',
          info: '#5B7C99',
          muted: '#8A8378',
        },
      },
    },
  },
};
```

---

## 7. Aplicación por módulo

### Web pública — motor de reservas

Predominio de `--sand-50` y `--white`. El dorado `--brand-300` se reserva
exclusivamente para el botón de "Reservar"; un solo acento por pantalla mantiene
la jerarquía clara. Las tarjetas de habitación van sobre `--white` con borde
`--sand-300` para que la fotografía se recorte limpiamente.

- Fondo de página: `--sand-50`
- Tarjetas de habitación: `--white` + borde `--sand-300`
- Calendario de disponibilidad: días libres en `--sand-100`, ocupados en `--sand-300`
- CTA "Reservar": fondo `--brand-300`, texto `--brand-900`
- Precios y tarifas: `--brand-900` en peso medio
- Badges de promoción (HU-09): fondo `--brand-300` al 15%, texto `--brand-600`

### Web privada — recepción

Es la pantalla más densa del sistema, así que el color debe usarse para codificar
estado, no para decorar.

- Barra lateral: `--brand-800`, ítem activo con fondo `--brand-600`
- Área de trabajo: `--sand-50`
- Tarjetas y paneles: `--white`
- Cabeceras de tabla: `--sand-200`
- Filas alternas: `--sand-50`
- Divisores: `--sand-300` a 0.5px

### App móvil del huésped

Más beige (`--sand-100`) que blanco puro: se lee mejor en pantallas pequeñas y
resulta menos agresivo de noche.

- Fondo: `--sand-100`
- Tarjetas de estadía y pedidos: `--white`
- Código de reserva (HU-11): fondo `--brand-800`, texto `--sand-100`
- Botones de solicitud de servicio: `--brand-300`
- Estados de pedido (HU-18): ver tabla de estados abajo

---

## 8. Estados operativos

### Calendario Gantt de recepción (HU-02)

| Estado                    | Color         | Hex       | Texto encima |
| ------------------------- | ------------- | --------- | ------------ |
| Disponible                | Verde salvia  | `#4F7A5B` | `#FFFFFF`    |
| Reservada (confirmada)    | Moka          | `#6B4F3A` | `#F3EADE`    |
| Ocupada (check-in activo) | Espresso      | `#2E211A` | `#F3EADE`    |
| Pendiente de pago         | Ámbar         | `#C08A2E` | `#2E211A`    |
| En limpieza               | Azul          | `#5B7C99` | `#FFFFFF`    |
| Bloqueada / mantenimiento | Neutro rayado | `#8A8378` | `#FFFFFF`    |
| Cancelada / no-show       | Terracota     | `#A9483C` | `#FFFFFF`    |

Para las barras bloqueadas conviene añadir un patrón de rayado diagonal además del
color, de modo que el estado no dependa únicamente del tono.

### Estados de pedido de Room Service (HU-18)

| Estado                | Color        | Hex       |
| --------------------- | ------------ | --------- |
| Pendiente             | Arena        | `#D9C7AE` |
| Aceptado              | Azul         | `#5B7C99` |
| En preparación        | Ámbar        | `#C08A2E` |
| En camino             | Caramelo     | `#8B6F52` |
| Entregado             | Verde salvia | `#4F7A5B` |
| Rechazado / cancelado | Terracota    | `#A9483C` |

### Estados de habitación para limpieza (HU-04 a HU-06)

| Estado                    | Color        | Hex       |
| ------------------------- | ------------ | --------- |
| Limpia / lista            | Verde salvia | `#4F7A5B` |
| Sucia / pendiente         | Ámbar        | `#C08A2E` |
| En limpieza               | Azul         | `#5B7C99` |
| Con desperfecto reportado | Terracota    | `#A9483C` |
| Fuera de servicio         | Neutro       | `#8A8378` |

---

## 9. Accesibilidad

Contraste medido sobre fondo blanco (`#FFFFFF`), según WCAG 2.1:

| Color              | Ratio  | Apto para                        |
| ------------------ | ------ | -------------------------------- |
| `#2E211A` Espresso | 14.8:1 | Todo tipo de texto               |
| `#4A3728` Café     | 10.2:1 | Todo tipo de texto               |
| `#6B4F3A` Moka     | 6.6:1  | Todo tipo de texto               |
| `#8B6F52` Caramelo | 4.2:1  | Solo texto grande (18px+)        |
| `#B08D57` Dorado   | 2.9:1  | **Solo como fondo**, nunca texto |

Puntos a cuidar:

- `--brand-300` (dorado) no debe usarse como color de texto sobre fondos claros.
  Para enlaces y texto de acento usar `--brand-600` o más oscuro.
- El botón dorado necesita texto `--brand-900` encima, no blanco: el blanco sobre
  dorado da un contraste de 2.4:1 y falla incluso para texto grande.
- Ningún estado debe comunicarse solo por color. Acompañar siempre con etiqueta de
  texto o icono, especialmente en el Gantt y en los estados de pedido.
- El ámbar `#C08A2E` como fondo de badge requiere texto `--brand-900`.

---

## 10. Modo oscuro (opcional)

Si más adelante se implementa, la inversión sugerida mantiene el carácter cálido
en lugar de pasar a grises neutros:

```css
[data-theme='dark'] {
  --sand-50: #1a1310;
  --sand-100: #241a15;
  --sand-200: #2e211a;
  --sand-300: #3d2e24;
  --white: #241a15;

  --text-primary: #f3eade;
  --text-secondary: #c1a98f;
  --text-muted: #8a8378;

  --brand-300: #c9a672;
}
```

Los colores semánticos se mantienen iguales, aclarándolos un 10% si el contraste
sobre el fondo oscuro resulta insuficiente.
