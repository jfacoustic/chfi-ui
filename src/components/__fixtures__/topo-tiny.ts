/**
 * Hand-crafted minimal TopoJSON: 3 square "countries" keyed by M49 numeric
 * id (840=USA, 124=CAN, 276=DEU) so the heat map can be rendered in tests
 * without fetching the real world atlas. Geometry is invented; only the
 * id/name fields matter for our assertions.
 */
export const topoTiny = {
  type: "Topology",
  arcs: [
    [
      [0, 0],
      [1000, 0],
      [1000, 1000],
      [0, 1000],
      [0, 0],
    ],
    [
      [2000, 0],
      [3000, 0],
      [3000, 1000],
      [2000, 1000],
      [2000, 0],
    ],
    [
      [4000, 0],
      [5000, 0],
      [5000, 1000],
      [4000, 1000],
      [4000, 0],
    ],
  ],
  transform: {
    scale: [0.0001, 0.0001],
    translate: [-180, -90],
  },
  objects: {
    countries: {
      type: "GeometryCollection",
      geometries: [
        {
          type: "Polygon",
          arcs: [[0]],
          id: "840",
          properties: { name: "United States of America" },
        },
        {
          type: "Polygon",
          arcs: [[1]],
          id: "124",
          properties: { name: "Canada" },
        },
        {
          type: "Polygon",
          arcs: [[2]],
          id: "276",
          properties: { name: "Germany" },
        },
      ],
    },
  },
} as const;
