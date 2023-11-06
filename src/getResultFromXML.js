export function getResultFromXML({ data: xml }) {
  const regex = /[<>\/]/g;
  const resultStr = xml.replace(regex, '').split('result')[1];
  return resultStr;
}
