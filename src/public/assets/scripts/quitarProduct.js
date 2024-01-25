const quitarBotones = document.querySelectorAll(".quitar-producto-btn");

quitarBotones.forEach((boton) => {
  boton.addEventListener("click", function (event) {
    event.preventDefault();

    const productId = this.getAttribute("data-product-id");

    fetch(`/api/carts/65adeb963cc98460cb29d707/quitarProducto`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId: productId }),
    })
      .then((response) => {
        if (response.status === 200) {
          window.location.reload(); // Recargar la página después de quitar el producto
        } else {
          // Manejar errores si es necesario
        }
      })
      .catch((error) => {
        console.error(error);
      });
  });
});


/*
const quitarBotones = document.querySelectorAll(".quitar-producto-btn");

quitarBotones.forEach((boton) => {
  boton.addEventListener("click", function (event) {
    event.preventDefault();

    const productId = this.getAttribute("data-product-id");

    fetch(`/api/carts/${userId}/quitarProducto/${productId}`, {
      method: "POST",
    })
      .then((response) => {
        if (response.status === 200) {
          window.location.reload(); // Recargar la página después de quitar el producto
        } else {
          // Manejar errores si es necesario
        }
      })
      .catch((error) => {
        console.error(error);
      });
  });
});
*/