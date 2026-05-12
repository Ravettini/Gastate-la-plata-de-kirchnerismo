export type GameDifficulty = 'Fácil' | 'Media' | 'Difícil'

export type GameCase = {
  id: string
  title: string
  category: string
  context: string
  hint: string
  explanation: string
  difficulty: GameDifficulty
  mapCenter: {
    lat: number
    lng: number
    zoom: number
  }
  targetLocation: {
    label: string
    lat: number
    lng: number
  }
}

export const enterrarlaTodaCases: GameCase[] = [
  {
    id: 'cruz-aike',
    title: 'Estancia Cruz Aike',
    category: 'Santa Cruz / Ruta del dinero K',
    context:
      'Durante investigaciones vinculadas a propiedades de Lázaro Báez en la Patagonia, se realizaron allanamientos y búsquedas con georradares en estancias cercanas a El Calafate y Río Gallegos. Una de las más mencionadas fue Cruz Aike.',
    hint: 'Zona rural de Santa Cruz, cerca de El Calafate, sobre el corredor de la Ruta Nacional 40.',
    explanation:
      'La estancia Cruz Aike fue señalada en investigaciones y coberturas periodísticas como una de las propiedades relevantes de Lázaro Báez en Santa Cruz. Está ubicada en la zona rural cercana a El Calafate.',
    difficulty: 'Media',
    mapCenter: { lat: -50.337, lng: -72.264, zoom: 8 },
    targetLocation: {
      label: 'Zona aproximada de Cruz Aike, cerca de El Calafate',
      lat: -50.55,
      lng: -72.05,
    },
  },
  {
    id: 'rosadita',
    title: 'La Rosadita',
    category: 'Puerto Madero / financiera SGI',
    context:
      'En una financiera ubicada en Puerto Madero, conocida públicamente como “La Rosadita”, se registraron videos en los que se veía el conteo de grandes sumas de dinero. El lugar quedó asociado mediáticamente a la causa conocida como Ruta del Dinero K.',
    hint: 'Está en la zona de Puerto Madero, Ciudad de Buenos Aires, dentro del complejo Madero Center.',
    explanation:
      'La financiera SGI, conocida como La Rosadita, funcionaba en el edificio Madero Center, en Puerto Madero.',
    difficulty: 'Fácil',
    mapCenter: { lat: -34.61, lng: -58.362, zoom: 14 },
    targetLocation: {
      label: 'Madero Center, Puerto Madero',
      lat: -34.6095,
      lng: -58.3631,
    },
  },
  {
    id: 'munoz',
    title: 'Propiedades de Daniel Muñoz',
    category: 'Exsecretario presidencial / inmuebles investigados',
    context:
      'Daniel Muñoz, exsecretario privado de Néstor Kirchner, fue investigado por la adquisición de propiedades y por el presunto traslado de bolsos con dinero desde Buenos Aires hacia el sur. La causa involucró inmuebles en distintas zonas del país.',
    hint: 'Una de las zonas más asociadas a su figura es Río Gallegos, Santa Cruz.',
    explanation:
      'Las investigaciones sobre Daniel Muñoz abarcaron distintas propiedades en Santa Cruz, Ciudad de Buenos Aires y otros puntos del país. Para el juego se toma como referencia aproximada Río Gallegos por su vínculo territorial con la trama.',
    difficulty: 'Difícil',
    mapCenter: { lat: -51.623, lng: -69.2168, zoom: 12 },
    targetLocation: {
      label: 'Río Gallegos, Santa Cruz',
      lat: -51.623,
      lng: -69.2168,
    },
  },
  {
    id: 'convento-lopez',
    title: 'El convento de General Rodríguez',
    category: 'José López / bolsos con dólares',
    context:
      'En 2016, el exfuncionario José López fue detenido luego de intentar esconder bolsos con casi 9 millones de dólares en un convento de General Rodríguez, provincia de Buenos Aires.',
    hint: 'Zona oeste del Gran Buenos Aires, partido de General Rodríguez.',
    explanation:
      'El episodio ocurrió en el monasterio Nuestra Señora del Rosario de Fátima, en General Rodríguez.',
    difficulty: 'Fácil',
    mapCenter: { lat: -34.609, lng: -58.955, zoom: 12 },
    targetLocation: {
      label: 'Zona aproximada del convento de General Rodríguez',
      lat: -34.6075,
      lng: -58.946,
    },
  },
  {
    id: 'base-china',
    title: 'Base espacial china en Neuquén',
    category: 'Infraestructura estratégica / Patagonia',
    context:
      'Una estación espacial operada en cooperación con China fue instalada en la provincia de Neuquén. El tema generó debates políticos y geopolíticos sobre su finalidad civil, científica y estratégica.',
    hint: 'Está en Bajada del Agrio, provincia de Neuquén, en la Patagonia argentina.',
    explanation: 'La estación de espacio lejano se encuentra en Neuquén, cerca de Bajada del Agrio.',
    difficulty: 'Media',
    mapCenter: { lat: -38.5, lng: -70.0, zoom: 8 },
    targetLocation: {
      label: 'Zona de Bajada del Agrio, Neuquén',
      lat: -38.55,
      lng: -70.0,
    },
  },
  {
    id: 'isla-demarchi',
    title: 'Polo Audiovisual Isla Demarchi',
    category: 'Proyecto de infraestructura cultural',
    context:
      'El proyecto del Polo Audiovisual en la Isla Demarchi fue anunciado como una iniciativa para concentrar actividades audiovisuales y culturales en la zona sur de la Ciudad de Buenos Aires.',
    hint: 'Está cerca de Puerto Madero, Costanera Sur y la zona portuaria.',
    explanation:
      'La Isla Demarchi se ubica en la zona sur de Puerto Madero / Costanera Sur, cerca del ingreso sur portuario.',
    difficulty: 'Media',
    mapCenter: { lat: -34.62, lng: -58.35, zoom: 14 },
    targetLocation: {
      label: 'Isla Demarchi, Ciudad de Buenos Aires',
      lat: -34.623,
      lng: -58.35,
    },
  },
  {
    id: 'once',
    title: 'Tren Sarmiento',
    category: 'Transporte ferroviario',
    context:
      'La línea Sarmiento quedó asociada a una de las mayores tragedias ferroviarias argentinas recientes, ocurrida en la estación Once. El episodio derivó en investigaciones sobre el estado del sistema ferroviario, subsidios y controles.',
    hint: 'Terminal ferroviaria del barrio de Balvanera, Ciudad de Buenos Aires.',
    explanation: 'La tragedia de Once ocurrió en la terminal de Once de la línea Sarmiento.',
    difficulty: 'Fácil',
    mapCenter: { lat: -34.608, lng: -58.407, zoom: 15 },
    targetLocation: {
      label: 'Estación Once, CABA',
      lat: -34.6083,
      lng: -58.4067,
    },
  },
  {
    id: 'tierra-fuego',
    title: 'Ensambladoras en Tierra del Fuego',
    category: 'Régimen industrial / tecnología',
    context:
      'El régimen industrial de Tierra del Fuego permitió la radicación de plantas ensambladoras de productos electrónicos, especialmente en Río Grande y Ushuaia. Fue defendido como política de desarrollo regional y criticado por su costo fiscal.',
    hint: 'La mayor concentración industrial está en Río Grande, Tierra del Fuego.',
    explanation:
      'Río Grande es una de las principales ciudades industriales de Tierra del Fuego, con presencia de plantas de electrónica.',
    difficulty: 'Fácil',
    mapCenter: { lat: -53.786, lng: -67.7, zoom: 11 },
    targetLocation: {
      label: 'Río Grande, Tierra del Fuego',
      lat: -53.786,
      lng: -67.7,
    },
  },
]
