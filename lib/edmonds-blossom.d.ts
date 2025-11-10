declare module 'edmonds-blossom' {
  function blossom(edges: [number, number, number][], maxCardinality?: boolean): number[];
  export default blossom;
}
