const express = require('express');
const fs = require('fs');

class ProductManager {
  constructor() {
    this.products = [];
    this.nextId = 1;
    this.fileName = 'products.json';
    this.loadProducts();
  }

  addProduct(product) {
    // Validar que todos los campos sean obligatorios
    if (
      !product.title ||
      !product.description ||
      !product.price ||
      !product.thumbnail ||
      !product.code ||
      !product.stock
    ) {
      console.log("Todos los campos son obligatorios");
      return;
    }

    // Validar que no se repita el campo "code"
    const existingProduct = this.products.find(
      (p) => p.code === product.code
    );
    if (existingProduct) {
      console.log("El código del producto ya existe");
      return;
    }

    // Asignar un ID autoincrementable
    product.id = this.nextId++;

    // Agregar el producto al arreglo de productos
    this.products.push(product);
    this.saveProducts();
  }

  getProducts() {
    return this.products;
  }

  getProductById(id) {
    const product = this.products.find((p) => p.id === id);
    if (product) {
      return product;
    } else {
      console.log("Producto no encontrado");
    }
  }

  updateProduct(id, updatedFields) {
    const productIndex = this.products.findIndex((p) => p.id === id);
    if (productIndex !== -1) {
      this.products[productIndex] = { ...this.products[productIndex], ...updatedFields };
      this.saveProducts();
    } else {
      console.log("Producto no encontrado");
    }
  }

  deleteProduct(id) {
    const productIndex = this.products.findIndex((p) => p.id === id);
    if (productIndex !== -1) {
      this.products.splice(productIndex, 1);
      this.saveProducts();
    } else {
      console.log("Producto no encontrado");
    }
  }

  loadProducts() {
    try {
      const data = fs.readFileSync(this.fileName, 'utf8');
      this.products = JSON.parse(data);
      const lastProduct = this.products[this.products.length - 1];
      this.nextId = lastProduct ? lastProduct.id + 1 : 1;
    } catch (error) {
      console.log("Error al leer el archivo de productos");
    }
  }

  saveProducts() {
    try {
      const data = JSON.stringify(this.products, null, 2);
      fs.writeFileSync(this.fileName, data);
    } catch (error) {
      console.log("Error al guardar el archivo de productos");
    }
  }
}

const app = express();
const productManager = new ProductManager();

app.get('/products', (req, res) => {
  const limit = req.query.limit;
  let products = productManager.getProducts();

  if (limit) {
    products = products.slice(0, limit);
  }

  res.json(products);
});

app.get('/products/:pid', (req, res) => {
  const productId = parseInt(req.params.pid);
  const product = productManager.getProductById(productId);

  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Producto no encontrado' });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});