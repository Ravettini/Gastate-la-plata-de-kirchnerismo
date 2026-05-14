import { ASSETS, type StoreId } from './assetUrls'

export const STORES: Record<
  StoreId,
  { name: string; image: string; employeeImage: string; resultText: string }
> = {
  coto: {
    name: 'COTO',
    image: ASSETS.selectCoto,
    employeeImage: ASSETS.cotoEmployee,
    resultText:
      'La góndola de COTO fue auditada con precisión militante.\nEl sótano sigue sin ser revisado.',
  },
  carrefour: {
    name: 'CARREFOUR MARKET',
    image: ASSETS.selectCarrefour,
    employeeImage: ASSETS.carrefourEmployee,
    resultText:
      'Carrefour intentó resistirse, pero el metro popular avanzó.\nLa caja 3 quedó ideológicamente comprometida.',
  },
  almacen: {
    name: 'ALMACÉN DE BARRIO',
    image: ASSETS.selectAlmacen,
    employeeImage: ASSETS.almacenEmployee,
    resultText:
      'Doña Loli no cedió.\nEl local tampoco.\nLa góndola, sin embargo, fue medida entre escombros simbólicos.',
  },
}
