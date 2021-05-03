import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@Rocketseat:cart');
    if (storagedCart) {
      return JSON.parse(storagedCart);
    }
    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const productList = [...cart];
      const productExists = productList.find(product => product.id === productId);
      const response = await api.get(`/stock/${productId}`);
      const amount = response.data.amount;
      const currentAmount = productExists ? productExists.amount : 0;
      const newAmount = currentAmount + 1;
      if(newAmount > amount){
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }
      if(productExists){
        productExists.amount = newAmount;
      }else{
        const responseProduct = await api.get(`/products/${productId}`);
        const newProduct = {
          ...responseProduct.data,
          amount: 1,
        }
        productList.push(newProduct);
      }
      setCart(productList);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(productList));
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const productList = [...cart];
      const productExists = productList.find(product => product.id === productId);
      if(productExists){
        const productIndex = productList.findIndex(product => product.id === productId);
        productList.splice(productIndex, 1);
        setCart(productList);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(productList));
      }else{
        toast.error('Erro na remoção do produto');
        return;
      }
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const productList = [...cart];
      const productExists = productList.find(product => product.id === productId);
      if(productExists){
        const productToUpdate = productList.filter(product => product.id === productId);
        const responseStock = await api.get(`/stock/${productId}`);
        if(amount > responseStock.data.amount){
          toast.error('Quantidade solicitada fora de estoque');
          return;
        }else if(amount < 1){
          toast.error('Erro na alteração de quantidade do produto');
          return;
        }else{
          productToUpdate[0].amount = amount;
          productList.map(item => {
            if(item.id === productToUpdate[0].id){
              item.amount = productToUpdate[0].amount;
            }
          })
          setCart(productList);
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(productList));
        }
      }else{
        toast.error('Erro na alteração de quantidade do produto');
      }
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
