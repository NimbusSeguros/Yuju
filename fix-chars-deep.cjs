const fs = require('fs');
const path = 'c:/Users/schut/yuju/src/pages/Cotizadores/MotoCotizador.tsx';

let content = fs.readFileSync(path, 'utf8');

// The FAQ section was totally broken
const cleanFAQ = `const motoFAQ = [
  { id: 1, title: "¿Es obligatorio contratar un seguro de moto?", subtitle: "Sí, es obligatorio. En Argentina, la ley exige que todo vehículo que circule por las calles tenga un seguro de responsabilidad civil, que cubre los daños que puedas ocasionar a terceros con tu moto. Así, podés manejar con tranquilidad y seguridad, sabiendo que estás cumpliendo con la normativa vigente." },
  { id: 2, title: "¿Qué tipo de seguro de moto puedo contratar?", subtitle: "Además del seguro obligatorio de responsabilidad civil, podés contratar otros tipos de seguro que te brindan una mayor protección para tu moto. Por ejemplo, podés contratar un seguro que cubra el robo total o parcial, el incendio total o parcial, o los daños propios de tu moto. En Yuju Seguros, te ofrecemos diferentes opciones de cobertura para que elijas la que más se adapte a tus necesidades y a tu presupuesto." },
  { id: 3, title: "Trabajo con mi moto, ¿Puedo asegurarla con Yuju?", subtitle: "Sí, podés asegurar tu moto sin importar que sea para trabajar. Tenemos un seguro que se adapta a tu tipo de uso: Particular, Delivery/Mensajería o Comercial, y que te cubre tanto a vos como a tu moto. Se encuentra excluido el uso para motos de competición." },
  { id: 4, title: "¿Podemos asegurar con patente en trámite?", subtitle: "Sí, podemos asegurar con patente en trámite, tenés un año para agregarla." },
  { id: 5, title: "¿Qué documentación necesito para contratar un seguro de moto?", subtitle: "Para contratar un seguro de moto, solo necesitás presentar tu DNI, la cédula verde y/o el título de tu moto. En Yuju Seguros, te facilitamos el proceso de contratación, para que puedas asegurar tu moto de forma rápida y sencilla." },
  { id: 6, title: "¿Cuándo tengo que pagar el seguro?", subtitle: "El seguro se paga por mes adelantado y la fecha de pago empieza desde el mismo día que lo contratás. Dependiendo de las pautas de cada compañía se puede modificar la fecha a tu conveniencia." },
  { id: 7, title: "¿Qué medios de pago puedo usar?", subtitle: "Tenés la opción de abonar mediante Pagofácil, Rapipago, Cobro Express, Mercado Pago, Pago Mis Cuentas, MODO. Y también podés adherir la póliza al débito automático con CBU o tarjeta de crédito." },
  { id: 8, title: "¿Cuenta con grúa al igual que los autos?", subtitle: "Sí, las pólizas de moto tienen servicio de grúa según la cobertura que contrates." },
  { id: 9, title: "¿Desde qué momento me encuentro cubierto?", subtitle: "A partir del momento en que abonás la cuota de la póliza estás cubierto. Algunas compañías te dan la cobertura completa desde el primer día; otras te dan solo la cobertura Responsabilidad Civil hasta que aprueben la inspección de tu moto." },
  { id: 10, title: "¿Inspeccionan mi vehículo?", subtitle: "La inspección es virtual y se hace por fotos. Para emitir necesitamos fotos de cada lado, cédula, número de chasis. El vehículo debe tener todos los requisitos para circular, como luces, espejos, etc." },
  { id: 11, title: "Tuve un siniestro, ¿qué debo hacer?", subtitle: "En caso de accidente es de suma importancia obtener los datos del tercero: DNI, dirección y teléfono. Del vehículo: Patente, Marca, Modelo y compañía de seguros. Si hay lesionados, hacé la denuncia policial. No hagas acuerdos ni firmes nada con el tercero." },
  { id: 12, title: "¿Qué tipos de motos puedo asegurar?", subtitle: "En Yuju podés asegurar todo tipo de rodados: motos, motocicletas, ciclomotores, enduro, entre otras." },
  { id: 13, title: "Si alguien más maneja mi moto, ¿tengo cobertura?", subtitle: "Sí. Te cubre a vos y al conductor de tu moto al momento del siniestro, siempre que esté habilitado para manejar (carnet y tarjeta azul)." },
  { id: 14, title: "¿Si vendo la moto, puedo transferir el seguro?", subtitle: "No, el seguro es intransferible. En este caso se anula la póliza a tu nombre y el nuevo titular puede contratar una nueva." },
  { id: 15, title: "¿Qué puede ocurrir si mi moto no está asegurada?", subtitle: "Estarías incumpliendo la ley de tránsito, que exige tener un seguro obligatorio de Responsabilidad Civil. Estarías cometiendo una infracción que te puede traer multas y sanciones." },
  { id: 16, title: "¿Cómo recibo la documentación?", subtitle: "Te mandamos la documentación en PDF por mail, Whatsapp o por la App móvil de cada seguro." },
  { id: 17, title: "¿Cuál es la vigencia de la póliza?", subtitle: "La vigencia suele ser anual con refacturaciones en el medio, que son actualizaciones del valor del vehículo y del seguro. El período de cada refacturación suele ser trimestral, pero puede variar por la inflación." },
  { id: 18, title: "¿Cómo se actualiza el valor de las coberturas?", subtitle: "La inflación puede desactualizar el valor de tu moto y de tu seguro. Existen distintas formas de actualizar el valor de las coberturas: cláusula de ajuste de suma asegurada, actualizar la suma asegurada en cada renovación, o solicitar el aumento durante la vigencia mediante un endoso." }
];`;

content = content.replace(/const motoFAQ = \[[\s\S]*?\];/m, cleanFAQ);

// Targeted regex fixes outside of FAQ using explicitly the U+FFFD block character
content = content.replace(/Complet\ufffd/g, "Completá")
                 .replace(/ingres\ufffd/g, "ingresá")
                 .replace(/Tel\u02FDfono/g, "Teléfono") // wait, select string showed Ǹ (0x01F8)? Actually \uFFFD is safe for all
                 .replace(/Veh\ufffdculo/g, "Vehículo")
                 .replace(/Ubicaci\ufffdn/g, "Ubicación")
                 .replace(/Cotizaci\ufffdn/g, "Cotización")
                 .replace(/Cotizaci\u00f3n/g, "Cotización") // from previous run?
                 .replace(/Protecci\ufffdn/g, "Protección")
                 .replace(/Cotiz\ufffd/g, "Cotizá")
                 .replace(/tecnolog\ufffda/g, "tecnología")
                 .replace(/A\ufffdO/g, "AÑO")
                 .replace(/seg\ufffdn/g, "según") // segǧn 01E7
                 .replace(/c\ufffddula/g, "cédula")
                 .replace(/Busc\ufffd/g, "Buscá")
                 .replace(/versi\ufffdn/g, "versión")
                 .replace(/espec\ufffdfica/g, "específica")
                 .replace(/C\ufffddigo/g, "Código")
                 .replace(/\ufffdxito/g, "éxito")
                 .replace(/pondr\ufffd/g, "pondrá")
                 .replace(/Quer\ufffds/g, "¿Querés")
                 .replace(/Quer\u02FDs/g, "¿Querés") 
                 .replace(/Pod\ufffds/g, "Podés")
                 .replace(/cotizaci\ufffdn/g, "cotización")
                 .replace(/n\ufffdmero/g, "número");

const replacementMap = [
    [/Complet\u01ED/g, 'Completá'],
    [/ingres\u01ED/g, 'ingresá'],
    [/Tel\u01F8fono/g, 'Teléfono'],
    [/intent\u01ED/g, 'intentá'],
    [/Veh\ufffdculo/g, 'Vehículo'],
    [/Ubicaci\ufffdn/g, 'Ubicación'],
    [/Cotizaci\ufffdn/g, 'Cotización'],
    [/Protecci\ufffdn/g, 'Protección'],
    [/Cotiz\u01ED/g, 'Cotizá'],
    [/tecnolog\ufffda/g, 'tecnología'],
    [/seg\u01E7n/g, 'según'],
    [/c\ufffddula/g, 'cédula'],
    [/Busc\u01ED/g, 'Buscá'],
    [/versi\ufffdn/g, 'versión'],
    [/espec\ufffdfica/g, 'específica'],
    [/C\ufffddigo/g, 'Código'],
    [/\u01F8xito/g, 'éxito'],
    [/pondr\u01ED/g, 'pondrá'],
    [/\u00bfQuer\u01F8s/g, '¿Querés'],
    [/Pod\u01F8s/g, 'Podés'],
    [/cotizaci\ufffdn/g, 'cotización'],
    [/n\ufffdmero/g, 'número']
];

for(const [regex, replacement] of replacementMap) {
    content = content.replace(regex, replacement);
}

fs.writeFileSync(path, content, 'utf8');
console.log("Deep unicode fixes applied with explicit U+01ED/U+01F8 mappings from powershell output");
