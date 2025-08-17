const { MongoClient, ObjectId } = require("mongodb");

const url = "mongodb+srv://fernandomatiasjuarez88:pwwm9eo6O7i7IKyv@basededatosmatias.fxkuru7.mongodb.net/?retryWrites=true&w=majority&appName=basededatosMATIAS";
const client = new MongoClient(url);
const dbName = "tienda";
const coleccionNombre = "productos";

// Obtener todos los productos
async function getProductos() {
  await client.connect();
  const db = client.db(dbName);
  const coleccion = db.collection(coleccionNombre);
  const productos = await coleccion.find({}).toArray();
  await client.close();
  return productos;
}

// Obtener categorías únicas
async function getCategorias() {
  await client.connect();
  const db = client.db(dbName);
  const coleccion = db.collection(coleccionNombre);
  const categorias = await coleccion.distinct("categoria");
  await client.close();
  return categorias;
}

// Producto random global
async function getRandomProducto() {
  await client.connect();
  const db = client.db(dbName);
  const coleccion = db.collection(coleccionNombre);

  // Buscar productos que no se hayan mostrado como destacados
  let productosNoDestacados = await coleccion.find({ destacado: { $ne: true } }).toArray();

  // Si ya se mostraron todos, reiniciamos destacados
  if (productosNoDestacados.length === 0) {
    await coleccion.updateMany({}, { $set: { destacado: false } });
    productosNoDestacados = await coleccion.find({}).toArray();
  }

  // Elegir uno al azar
  const randomIndex = Math.floor(Math.random() * productosNoDestacados.length);
  const producto = productosNoDestacados[randomIndex];

  // Marcar como destacado
  await coleccion.updateMany({}, { $set: { destacado: false } });
  await coleccion.updateOne({ _id: producto._id }, { $set: { destacado: true } });

  await client.close();
  return producto;
}


// Producto random por categoría
async function getRandomProductoPorCategoria(categoria) {
  await client.connect();
  const db = client.db(dbName);
  const coleccion = db.collection(coleccionNombre);
  const productos = await coleccion.find({ categoria }).toArray();
  await client.close();

  if (productos.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * productos.length);
  return productos[randomIndex];
}

module.exports = { getProductos, getCategorias, getRandomProducto, getRandomProductoPorCategoria };
