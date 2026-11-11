export const event = {
 name: 'Dulce Abigail Flores Martínez', shortName: 'Dulce Abigail',
 date: 'Sábado 26 de diciembre de 2026', target: '2026-12-26T12:00:00-06:00',
 parents: ['Dulce María Martínez Toribio', 'Miguel Ángel Flores Bautista'], godmother: 'Yazareth Martínez Toribio',
 ceremony: { name: 'Iglesia del Divino Salvador', time: '12:00 p. m.', address: 'Av. 16 de Enero 1869, Centro, 42640 San Salvador, Hidalgo.', map: 'https://maps.app.goo.gl/SWjeJzgHgNn4MQjF9' },
 reception: {time: '3:00 p. m.', address: 'Calle Camino Viejo S/N', map: 'https://maps.app.goo.gl/JtC1AQqmmrBNLCzVA'},
 whatsapp: '527721390093', phone: '772 139 0093',
};
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;
export const photo = (id: number, size = 960) => asset(`images/momento-${String(id).padStart(2,'0')}-${size}.webp`);
export const descriptions = ['Dulce Abigail dormida entre una cobijita rosa','Sus primeros días, abrigada con cariño','Un dulce sueño de recién nacida','Sus papás esperando su llegada al atardecer','La familia celebra su llegada','Una noche de celebración en familia','Dulce Abigail en los brazos de sus papás','Dulce Abigail celebra su primer mes','Un nuevo mes lleno de sonrisas','Un retrato de Dulce Abigail con sus papás','Dulce Abigail y los colores del otoño'];
