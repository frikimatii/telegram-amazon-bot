const { MongoClient, ObjectId } = require("mongodb");

const client = new MongoClient(process.env.MONGO_URI, {
  tls: true,
  tlsAllowInvalidCertificates: false,
   serverApi: { version: "1" }
});

const dbName = "tienda";
const coleccionNombre = "productos";

let db, coleccion;

async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db(dbName);
    coleccion = db.collection(coleccionNombre);
    console.log("✅ Conectado a MongoDB");
  }
  return coleccion;
}

// Obtener todos los productos
async function getProductos() {
  const coleccion = await connectDB();
  return coleccion.find({}).toArray();
}

// Obtener categorías únicas
async function getCategorias() {
  const coleccion = await connectDB();
  return coleccion.distinct("categoria");
}

// Producto random global
async function getRandomProducto() {
  const coleccion = await connectDB();
  let productosNoDestacados = await coleccion.find({ destacado: { $ne: true } }).toArray();

  if (productosNoDestacados.length === 0) {
    await coleccion.updateMany({}, { $set: { destacado: false } });
    productosNoDestacados = await coleccion.find({}).toArray();
  }

  const randomIndex = Math.floor(Math.random() * productosNoDestacados.length);
  const producto = productosNoDestacados[randomIndex];

  await coleccion.updateMany({}, { $set: { destacado: false } });
  await coleccion.updateOne({ _id: producto._id }, { $set: { destacado: true } });

  return producto;
}

// Producto random por categoría
async function getRandomProductoPorCategoria(categoria) {
  const coleccion = await connectDB();
  const productos = await coleccion.find({ categoria }).toArray();
  if (productos.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * productos.length);
  return productos[randomIndex];
}

module.exports = { getProductos, getCategorias, getRandomProducto, getRandomProductoPorCategoria };
