/* eslint-disable @typescript-eslint/no-explicit-any */
// Declaração mínima para uso do pdfjs-dist no cliente sem alterar lógica
// Isso evita erros de tipagem do TS ao fazer import dinâmico em componentes client-side.
declare module 'pdfjs-dist/legacy/build/pdf' {
  // Estrutura flexível, pois usamos import dinâmico e APIs variadas
  export const GlobalWorkerOptions: any;
  export function getDocument(params: any): any;
  const _default: any;
  export default _default;
}
