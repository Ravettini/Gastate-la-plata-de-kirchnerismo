/** Rutas públicas exactas: carpeta `public/FOTO JUEGOS GONDOLA/` (espacios codificados en URL). */
export function assetUrl(file: string): string {
  return '/FOTO%20JUEGOS%20GONDOLA/' + encodeURIComponent(file)
}

export const ASSETS = {
  intro: assetUrl('gordoprimeraimagendialogo.png'),
  finalKumpa: assetUrl('gordosegundaimagendialogofinal.png'),
  selectCoto: assetUrl('coto.png'),
  selectCarrefour: assetUrl('carrefour.png'),
  selectAlmacen: assetUrl('supermercado de barrio.png'),
  cotoEmployee: assetUrl('empleado coto.png'),
  carrefourEmployee: assetUrl('empleado carrefour.png'),
  almacenEmployee: assetUrl('supermercado de barrio empleado.png'),
  gondolaPixel: assetUrl('gondola.png'),
  tapeMeasure: assetUrl('metro.png'),
  tapeMeasureHorizontal: assetUrl('metro horizontal.png'),
  tapeMeasureRight: assetUrl('metro horizontal apuntando a la derecha.png'),
  tapeMeasureDown: assetUrl('metro apuntando para abajo.png'),
  finalBeaten: assetUrl('imagen final.png'),
} as const

export type StoreId = 'coto' | 'carrefour' | 'almacen'
