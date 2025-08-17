const TelegramBot = require("node-telegram-bot-api");
const { getCategorias, getRandomProducto, getRandomProductoPorCategoria } = require("./db");

// Token de tu bot
const token = "8499019920:AAHzFqodCClJUhxH-X3tvlNxuYFfcA5dnIE";
const bot = new TelegramBot(token, { polling: true });

// ID del chat o grupo para producto destacado cada hora
const CHAT_ID_GENERAL = "6436144827";

// Mensaje de bienvenida con emojis
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
const bienvenida = `
👋 ¡Hola ${msg.from.first_name}!

💡 Este bot te ayuda a encontrar productos con ofertas de Amazon:

🔥 /oferta - Ver un producto de *Oferta Especial*
📂 /categoria - Elegir un producto por categoría
⏰ Cada hora recibirás un producto destacado automáticamente

💰 Todos los productos incluyen enlaces de referido de Amazon
`;

  bot.sendMessage(chatId, bienvenida);
});

// Comando /oferta -> producto aleatorio como oferta especial
bot.onText(/\/oferta/, async (msg) => {
  const chatId = msg.chat.id;
  const producto = await getRandomProducto();

  if (!producto) {
    bot.sendMessage(chatId, "❌ No hay productos disponibles.");
    return;
  }

  bot.sendPhoto(chatId, producto.imagen, {
    caption: `🔥 *Oferta Especial*\n\n🎁 *${producto.nombre}*\n${producto.descripcion}\n\n💲 Precio: $${producto.precio}\n\n🔗 [Ver en Amazon](${producto.URLproducto})`,
    parse_mode: "Markdown"
  });
});

// Comando /categoria -> muestra categorías con teclado inline
bot.onText(/\/categoria/, async (msg) => {
  const chatId = msg.chat.id;
  const categorias = await getCategorias();

  if (categorias.length === 0) {
    bot.sendMessage(chatId, "❌ No hay categorías disponibles.");
    return;
  }

  const botones = categorias.map((cat) => [{ text: `📂 ${cat}`, callback_data: cat }]);

  bot.sendMessage(chatId, "📋 Elegí una categoría:", {
    reply_markup: { inline_keyboard: botones }
  });
});

// Manejar elección de categoría
bot.on("callback_query", async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const categoria = callbackQuery.data;

  const producto = await getRandomProductoPorCategoria(categoria);

  if (!producto) {
    bot.sendMessage(chatId, "❌ No hay productos en esta categoría.");
    return;
  }

  bot.sendPhoto(chatId, producto.imagen, {
    caption: `🎁 *${producto.nombre}*\n\n${producto.descripcion}\n\n💲 Precio: $${producto.precio}\n\n🔗 [Ver en Amazon](${producto.URLproducto})`,
    parse_mode: "Markdown"
  });
});

// Enviar producto destacado cada hora con formato
async function enviarProductoHora() {
  const producto = await getRandomProducto();
  if (!producto) return;

  bot.sendPhoto(CHAT_ID_GENERAL, producto.imagen, {
    caption: `✨ *Producto destacado del día*\n\n🎁 *${producto.nombre}*\n${producto.descripcion}\n\n💲 Precio: $${producto.precio}\n\n🔗 [Ver en Amazon](${producto.URLproducto})`,
    parse_mode: "Markdown"
  });
}

// Ejecutar cada hora
setInterval(enviarProductoHora, 1000 * 60 * 60);

// Enviar al iniciar el bot
enviarProductoHora();
