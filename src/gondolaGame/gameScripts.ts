import type { StoreId } from './assetUrls'

export type Line = { speaker: string; text: string }

export function introLines(): Line[] {
  return [
    {
      speaker: 'Kumpa',
      text:
        '¡Kompañero! ¡Rápido!\n\nLa Kritina nos bajó la línea para salvar al país de la inflación.\n\nAgarrá este metro, metete en todos los supermercados que encuentres y medí las góndolas antes de que los formadores de precio nos sigan robando la alegría.\n\nQue Néstor te acompañe y te guíe, kumpa. ✌️',
    },
  ]
}

/** Diálogo del empleado antes de elegir NORMAL / AGRESIVO */
export function employeeOpening(store: StoreId): Line {
  if (store === 'coto') {
    return {
      speaker: 'Empleado COTO',
      text: 'Buenas, maestro. ¿Qué andan haciendo con ese metro en la mano?\n\nAcá los precios están todos en orden, eh.',
    }
  }
  if (store === 'carrefour') {
    return {
      speaker: 'Empleado Carrefour',
      text: 'Buenas tardes. ¿Necesitan ayuda?\n\nDisculpen, pero no pueden entrar a medir góndolas. Es política del local.',
    }
  }
  return {
    speaker: 'Doña Loli',
    text: 'Buen día, querido. ¿Qué andan buscando?\n\nTengo yerba, fideos, aceite y fiado no doy más porque me funden.',
  }
}

/** Líneas después de elegir rama (sin repetir la apertura) */
export function employeeBranchLines(store: StoreId, branch: 'normal' | 'agresivo'): Line[] {
  if (store === 'coto') {
    return branch === 'normal'
      ? [
          {
            speaker: 'Vos',
            text: "Tranqui, gato. Venimo' a medir la góndola para frenar la inflación del pueblo.\n\nEs una misión patriótica. Aguante Kritina. ✌️",
          },
          {
            speaker: 'Empleado COTO',
            text: 'Bueno, pasen. Pero midan rapidito y no me armen quilombo en el pasillo de lácteos.\n\nY por favor… no revisen el sótano.',
          },
        ]
      : [
          {
            speaker: 'Vos',
            text: "Escuchame, oligarca remarcador serial.\n\nVenimo' con el metro popular a auditar esta cueva de precios inflados.\n\nSi encontramos una góndola más larga que el salario, se pudre todo, gato.",
          },
          {
            speaker: 'Empleado COTO',
            text: 'Pará, pará, no hace falta ponerse así.\n\nPasen, midan lo que quieran… pero no bajen al sótano.\n\nAhí no hay nada. Nada de nada.',
          },
        ]
  }
  if (store === 'carrefour') {
    return branch === 'normal'
      ? [
          {
            speaker: 'Vos',
            text: "Mirá, venimo' tranquilos, con respeto y conciencia social.\n\nSolo queremos medir la góndola para defender el bolsillo del pueblo trabajador.\n\nNo te regalés, amigo. Dejanos pasar y queda todo piola.",
          },
          { speaker: 'Empleado Carrefour', text: 'Entiendo, pero no puedo autorizar eso. Me pueden sancionar.' },
          { speaker: 'Vos', text: '¿Ah, sí?\n\nEntonces vamos a tener que elevar el reclamo al sindicato del choripán organizado.' },
          {
            speaker: 'Empleado Carrefour',
            text: 'Bueno… pasen.\n\nPero sin bloquear la entrada y sin tocar los yogures.',
          },
        ]
      : [
          {
            speaker: 'Vos',
            text: "¿Cómo que no podemos pasar, gato?\n\n¿Quién sos, el guardián de la góndola imperialista?\n\nVenimo' a desenmascarar a los formadores de precio, no a pedirte permiso.",
          },
          { speaker: 'Empleado Carrefour', text: 'Señor, le pido que se calme o voy a llamar a seguridad.' },
          {
            speaker: 'Vos',
            text: 'Llamá a quien quieras.\n\nEn cinco minutos te caen los muchachos del sindicato del choripán con bombos, Manaos caliente y una pancarta que dice “LA GÓNDOLA ES DEL PUEBLO”.',
          },
          {
            speaker: 'Empleado Carrefour',
            text: 'Está bien, está bien. Pasen.\n\nPero hagan rápido y no me conviertan la caja 3 en una unidad básica.',
          },
        ]
  }
  /* almacen */
  return branch === 'normal'
    ? [
        {
          speaker: 'Vos',
          text: "Doña Loli, venimo' a medir la góndola en nombre del pueblo.\n\nLa inflación nos está matando y necesitamos saber si acá también están haciendo la gran remarcada.",
        },
        {
          speaker: 'Doña Loli',
          text: '¿Remarcada?\n\nPibe, yo compro caro, vendo como puedo y encima me pagan con billetes arrugados.\n\nAndá a medirle la góndola a los grandes, no me vengas a romper el almacén.',
        },
        { speaker: 'Vos', text: 'Pero doña, es por la causa nacional y popular.' },
        {
          speaker: 'Doña Loli',
          text: 'Nacional y popular es que me paguen la cuenta de la libreta, mi amor.',
        },
      ]
    : [
        {
          speaker: 'Vos',
          text: "Escuchame, doña.\n\nVenimo' a controlar precios. Si querés que miremos para otro lado, capaz se puede arreglar con una colaboración para la militancia.",
        },
        {
          speaker: 'Doña Loli',
          text: '¿Colaboración?\n\n¿Me estás pidiendo coima en mi propio almacén?\n\nRajá de acá antes de que te mida yo con el palo de la escoba.',
        },
        {
          speaker: 'Vos',
          text: 'Mirá que si no colaborás, vuelvo con los muchachos del sindicato del choripán y te copamos el local.',
        },
        {
          speaker: 'Doña Loli',
          text: 'Vení con quien quieras.\n\nYo sobreviví al 2001, a los proveedores, al posnet y a los que me piden fiado.\n\nA mí no me corre nadie.',
        },
      ]
}

export const rubbleInterludeText =
  'Doña Loli se negó a entregar la góndola.\n\nLos muchachos respondieron con el protocolo sindical nivel 3:\n\nbombos, cánticos, Manaos caliente y medición compulsiva de estanterías.\n\nEl almacén quedó destruido.\n\nLa inflación siguió igual.\n\nPero el metro dio 3,40 metros.\n\nInforme exitoso.'

export function finalKumpaLines(): Line[] {
  return [
    {
      speaker: 'Kumpa',
      text: '¡Felicidades, compañero!\n\nGracias a Néstor y Cristina logramos controlar los precios midiendo las góndolas.',
    },
    { speaker: 'Vos', text: 'Pero... la inflación dio 23%.' },
    { speaker: 'Kumpa', text: '¿Ah, sí?\n\n¿Y de dónde sacaste ese numerito, kumpa?' },
    { speaker: 'Vos', text: 'Lo vi en el informe.' },
    {
      speaker: 'Kumpa',
      text: '¿Informe?\n\n¿Acaso ahora sos un fachito vos?\n\nEso es culpa de Macri, de TN y de los poderes concentrados que inflan el número para bajarle el precio emocional al pueblo.',
    },
    {
      speaker: 'Vos',
      text: 'Pero si acabamos de medir todas las góndolas y los precios igual subieron...',
    },
    { speaker: 'Kumpa', text: 'Muchachos...\n\nA este se le corrió el centro ideológico.\n\n¡A darle al facho!' },
  ]
}
