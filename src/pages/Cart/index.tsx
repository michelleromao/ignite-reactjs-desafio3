import React from 'react';
import {
  MdDelete,
  MdAddCircleOutline,
  MdRemoveCircleOutline,
} from 'react-icons/md';

import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../util/format';
import { Container, ProductTable, Total } from './styles';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
}

const Cart = (): JSX.Element => {
  const { cart, removeProduct, updateProductAmount } = useCart();

  const cartFormatted = cart.map(product => ({
    ...product,
    priceFormatted: formatPrice(product.price * product.amount)
  }));

  const total =
    formatPrice(
      cart.reduce((sumTotal, product) => {
        sumTotal += (product.amount * product.price)
        return sumTotal;
      }, 0)
     )

  function handleProductIncrement(product: Product) {
    const increment = product.amount + 1;
    updateProductAmount({productId: product.id, amount: increment});
  }

  function handleProductDecrement(product: Product) {
    const decrement = product.amount - 1;
    updateProductAmount({productId: product.id, amount: decrement});
  }

  function handleRemoveProduct(productId: number) {
    removeProduct(productId);
  }

  return (
    <Container>
      <ProductTable>
        <thead>
          <tr>
            <th aria-label="product image" />
            <th>PRODUTO</th>
            <th>QTD</th>
            <th>SUBTOTAL</th>
            <th aria-label="delete icon" />
          </tr>
        </thead>
        <tbody>
          {cartFormatted && cartFormatted.map(item => 
             <tr data-testid="product" key={item.id}>
             <td>
               <img src={item.image} alt={item.title} />
             </td>
             <td>
               <strong>{item.title}</strong>
               <span>{formatPrice(item.price)}</span>
             </td>
             <td>
               <div>
                 <button
                   type="button"
                   data-testid="decrement-product"
                   disabled={item.amount <= 1}
                   onClick={() => handleProductDecrement(item)}
                 >
                   <MdRemoveCircleOutline size={20} />
                 </button>
                 <input
                   type="text"
                   data-testid="product-amount"
                   readOnly
                   value={item.amount}
                 />
                 <button
                   type="button"
                   data-testid="increment-product"
                   onClick={() => handleProductIncrement(item)}
                 >
                   <MdAddCircleOutline size={20} />
                 </button>
               </div>
             </td>
             <td>
               <strong>{item.priceFormatted}</strong>
             </td>
             <td>
               <button
                 type="button"
                 data-testid="remove-product"
                 onClick={() => handleRemoveProduct(item.id)}
               >
                 <MdDelete size={20} />
               </button>
             </td>
           </tr>
        
          )}
        </tbody>
      </ProductTable>

      <footer>
        <button type="button">Finalizar pedido</button>

        <Total>
          <span>TOTAL</span>
          <strong>{total}</strong>
        </Total>
      </footer>
    </Container>
  );
};

export default Cart;
