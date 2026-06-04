import React from 'react';
import { ControlCentral } from './components/ControlCentral';

export const formatNumber = (num: number) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD", // Usamos USD para no mostrar "ARS", mostramos el símbolo $ o USD
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num).replace("USD", "$"); // Ajuste por si el local a veces muestra USD
};

export default function App() {
  return <ControlCentral />;
}
