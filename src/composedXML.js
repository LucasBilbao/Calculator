export function composedXML(operation, queries) {
  let xml = `<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/"><Body><${operation}Request xmlns="http://tempuri.org/">`;

  Object.entries(queries).forEach(([key, value]) => {
    xml = `${xml}<${key}>${value}</${key}>`;
  });

  xml = `${xml}</${operation}Request></Body></Envelope>`;
  return xml;
}
